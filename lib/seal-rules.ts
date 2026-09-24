// Pure rules for sealing a Letter (SPEC §5 Create), kept apart from the DB so they can be tested.

export const LETTER_CAP = 20;

export type SealingAuthor = { id: string; emailVerified: boolean };

export type SealOutcome = "insert" | "already-sealed" | "id-taken" | "capped";

/**
 * Decides what sealing does. A re-sent draft whose Letter exists is already sealed, even at
 * the cap; an id held by another Author is refused rather than silently dropped.
 */
export function sealOutcome(
  author: SealingAuthor,
  existingAuthorId: string | null,
  sealedCount: number,
): SealOutcome {
  if (existingAuthorId !== null) return existingAuthorId === author.id ? "already-sealed" : "id-taken";
  return sealedCount >= LETTER_CAP ? "capped" : "insert";
}

/** SCHEDULED once the Author's email is verified, PENDING until then. */
export function initialStatus(author: SealingAuthor): "SCHEDULED" | "PENDING" {
  return author.emailVerified ? "SCHEDULED" : "PENDING";
}
