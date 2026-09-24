import { db } from "@/lib/db";
import type { LetterStatus } from "@/lib/generated/prisma/client";
import { addDays, fromUtcDate, isDue, todayIn, toUtcDate } from "@/lib/delivery-date";
import type { DeliveryUpdate } from "@/lib/delivery-rules";
import { decrypt, encrypt } from "@/lib/encryption";
import type { LetterInput } from "@/lib/letter-input";
import { initialStatus, type SealingAuthor, sealOutcome } from "@/lib/seal-rules";

// Every LetterStatus change goes through this module (CLAUDE.md → Types & data).

const SEALED_STATUSES = ["PENDING", "SCHEDULED"] satisfies LetterStatus[];
const ARCHIVED_STATUSES = ["DELIVERED", "UNDELIVERABLE"] satisfies LetterStatus[];
const CLAIM_TIMEOUT_MS = 60 * 60 * 1000;

export type SealedLetter = {
  id: string;
  subject: string | null;
  status: (typeof SEALED_STATUSES)[number];
  deliveryDate: string;
  timeZone: string;
};

export type ArchivedLetter = {
  id: string;
  subject: string | null;
  body: string;
  status: (typeof ARCHIVED_STATUSES)[number];
  createdAt: Date;
  deliveredAt: Date | null;
  timeZone: string;
};

/**
 * Seals a Letter for its Author, PENDING or SCHEDULED (SPEC §5 Create). Re-sealing the same
 * draft is a no-op, so a retried send never makes a second Letter.
 */
export async function sealLetter(
  author: SealingAuthor,
  letter: LetterInput,
): Promise<"sealed" | "capped" | "id-taken"> {
  const [existing, sealedCount] = await Promise.all([
    db.letter.findUnique({ where: { id: letter.id }, select: { authorId: true } }),
    db.letter.count({ where: { authorId: author.id, status: { in: SEALED_STATUSES } } }),
  ]);
  // ponytail: count-then-insert can let two simultaneous sends reach 21; a locked count if that matters.
  const outcome = sealOutcome(author, existing?.authorId ?? null, sealedCount);
  if (outcome === "already-sealed") return "sealed";
  if (outcome !== "insert") return outcome;

  await db.letter.createMany({
    data: {
      id: letter.id,
      authorId: author.id,
      subject: letter.subject === null ? null : encrypt(letter.subject),
      body: encrypt(letter.body),
      deliveryDate: toUtcDate(letter.deliveryDate),
      timeZone: letter.timeZone,
      status: initialStatus(author),
    },
    // A double-click racing itself lands here; the first insert wins.
    skipDuplicates: true,
  });
  return "sealed";
}

/** PENDING → SCHEDULED for every Letter of an Author who just verified their email (SPEC §5 Verify). */
export async function scheduleVerifiedLetters(authorId: string): Promise<void> {
  await db.letter.updateMany({ where: { authorId, status: "PENDING" }, data: { status: "SCHEDULED" } });
}

/** The sealed view of a Letter: its date, never its body (SPEC §5 Sealed). */
export async function findSealedLetter(
  id: string,
  authorId: string,
): Promise<{ deliveryDate: string; timeZone: string } | null> {
  const letter = await db.letter.findFirst({
    where: { id, authorId, status: { in: SEALED_STATUSES } },
    select: { deliveryDate: true, timeZone: true },
  });
  return letter && { deliveryDate: fromUtcDate(letter.deliveryDate), timeZone: letter.timeZone };
}

/**
 * An Author's letters for /letters: the Sealed list, soonest first, and the Archive, newest
 * first. Sealed bodies are never read, let alone decrypted (SPEC §5 Sealed).
 */
export async function listLetters(authorId: string): Promise<{ sealed: SealedLetter[]; archive: ArchivedLetter[] }> {
  const [sealed, archive] = await Promise.all([
    db.letter.findMany({
      where: { authorId, status: { in: SEALED_STATUSES } },
      select: { id: true, subject: true, status: true, deliveryDate: true, timeZone: true },
      orderBy: [{ deliveryDate: "asc" }, { createdAt: "asc" }],
    }),
    db.letter.findMany({
      where: { authorId, status: { in: ARCHIVED_STATUSES } },
      select: {
        id: true,
        subject: true,
        body: true,
        status: true,
        createdAt: true,
        deliveredAt: true,
        timeZone: true,
      },
      orderBy: [{ deliveryDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);
  return {
    sealed: sealed.map((letter) => ({
      ...letter,
      status: letter.status as SealedLetter["status"],
      subject: decryptSubject(letter.subject),
      deliveryDate: fromUtcDate(letter.deliveryDate),
    })),
    archive: archive.map((letter) => ({
      ...letter,
      status: letter.status as ArchivedLetter["status"],
      subject: decryptSubject(letter.subject),
      body: decrypt(letter.body),
    })),
  };
}

/**
 * Cancelling a Sealed Letter and deleting one from the Archive are both a hard delete
 * (SPEC §5). A Letter the daily run has claimed (SENDING) is left alone.
 */
export async function deleteLetter(id: string, authorId: string): Promise<boolean> {
  const { count } = await db.letter.deleteMany({ where: { id, authorId, status: { not: "SENDING" } } });
  return count > 0;
}

/**
 * SENDING Letters claimed over an hour ago go back to SCHEDULED: the run that claimed them died
 * mid-send (SPEC §7 step 2). Their resend reuses the same idempotency key, but Resend keeps keys
 * for 24 h and this runs daily, so a send that went through just before the run died can repeat.
 */
export async function releaseStaleClaims(now: Date): Promise<number> {
  const { count } = await db.letter.updateMany({
    where: { status: "SENDING", claimedAt: { lt: new Date(now.getTime() - CLAIM_TIMEOUT_MS) } },
    data: { status: "SCHEDULED" },
  });
  return count;
}

/** Delivery emails sent since midnight UTC, for the run's budget (SPEC §7 step 4). */
export async function countDeliveredToday(now: Date): Promise<number> {
  return db.letter.count({ where: { deliveredAt: { gte: toUtcDate(todayIn("UTC", now)) } } });
}

/** A Letter the run holds as SENDING, still encrypted, with its Author's email read at send time (SPEC §5). */
export type ClaimedLetter = {
  id: string;
  subject: string | null;
  body: string;
  deliveryDate: Date;
  timeZone: string;
  createdAt: Date;
  attempts: number;
  email: string;
};

/**
 * Claims up to `budget` due Letters, soonest first, as SENDING (SPEC §7 step 5). SKIP LOCKED
 * and the status re-check let a doubled run pass over whatever this one holds.
 */
export async function claimDueLetters(now: Date, budget: number): Promise<ClaimedLetter[]> {
  if (budget === 0) return [];
  // No timezone is a whole day ahead of UTC, so nothing dated after UTC's tomorrow can be due.
  const candidates = await db.letter.findMany({
    where: { status: "SCHEDULED", deliveryDate: { lte: toUtcDate(addDays(todayIn("UTC", now), 1)) } },
    select: { id: true, deliveryDate: true, timeZone: true },
  });
  const dueIds = candidates
    .filter((letter) => isDue({ deliveryDate: fromUtcDate(letter.deliveryDate), timeZone: letter.timeZone }, now))
    .map((letter) => letter.id);
  if (dueIds.length === 0) return [];

  return db.$queryRaw<ClaimedLetter[]>`
    UPDATE "Letter" SET status = 'SENDING', "claimedAt" = ${now}
    WHERE id IN (
      SELECT id FROM "Letter"
      WHERE id = ANY(${dueIds}) AND status = 'SCHEDULED'
      ORDER BY "deliveryDate", "createdAt"
      LIMIT ${budget}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, subject, body, "deliveryDate", "timeZone", "createdAt", attempts,
      (SELECT email FROM "user" WHERE "user".id = "authorId") AS email`;
}

/**
 * Moves a claimed Letter on after its send (SPEC §7 step 7). Only a Letter still SENDING moves,
 * so an account deleted mid-run is simply gone.
 */
export async function recordSend(id: string, update: DeliveryUpdate, now: Date): Promise<void> {
  const data = update.status === "DELIVERED" ? { ...update, deliveredAt: now } : update;
  await db.letter.updateMany({ where: { id, status: "SENDING" }, data });
}

export function decryptSubject(subject: string | null): string | null {
  return subject === null ? null : decrypt(subject);
}
