import { db } from "@/lib/db";
import type { LetterStatus } from "@/lib/generated/prisma/client";
import { fromUtcDate, toUtcDate } from "@/lib/delivery-date";
import { decrypt, encrypt } from "@/lib/encryption";
import type { LetterInput } from "@/lib/letter-input";
import { initialStatus, type SealingAuthor, sealOutcome } from "@/lib/seal-rules";

// Every LetterStatus change goes through this module (CLAUDE.md → Types & data).

const SEALED_STATUSES = ["PENDING", "SCHEDULED"] satisfies LetterStatus[];
const ARCHIVED_STATUSES = ["DELIVERED", "UNDELIVERABLE"] satisfies LetterStatus[];

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

function decryptSubject(subject: string | null): string | null {
  return subject === null ? null : decrypt(subject);
}
