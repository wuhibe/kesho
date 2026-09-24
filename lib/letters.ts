import { db } from "@/lib/db";
import { fromUtcDate, toUtcDate } from "@/lib/delivery-date";
import { encrypt } from "@/lib/encryption";
import type { LetterInput } from "@/lib/letter-input";
import { initialStatus, type SealingAuthor, sealOutcome } from "@/lib/seal-rules";

// Every LetterStatus change goes through this module (CLAUDE.md → Types & data).

const SEALED_STATUSES: ("PENDING" | "SCHEDULED")[] = ["PENDING", "SCHEDULED"];

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
