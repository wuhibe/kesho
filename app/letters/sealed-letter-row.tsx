import type { FC } from "react";
import type { SealedLetter } from "@/lib/letters";
import { sealedLabel } from "@/lib/sealed-label";
import { ConfirmDelete } from "./confirm-delete";
import { LetterSubject } from "./letter-subject";

/** A Sealed row: subject and date only, never the body, with Cancel (SPEC §3 /letters). */
export const SealedLetterRow: FC<{ letter: SealedLetter }> = ({ letter }) => (
  <li className="flex flex-wrap items-center justify-between gap-4 py-4">
    <span>
      <LetterSubject subject={letter.subject} />
      <span className="font-mono text-xs uppercase text-bark">{sealedLabel(letter)}</span>
    </span>
    <ConfirmDelete letterId={letter.id} label="Cancel" confirmLabel="Cancel letter" />
  </li>
);
