import type { FC } from "react";
import { formatDate, todayIn } from "@/lib/delivery-date";
import type { ArchivedLetter } from "@/lib/letters";
import { ConfirmDelete } from "./confirm-delete";
import { LetterSubject } from "./letter-subject";

/** An Archive row that expands to the Letter in full, with Delete (SPEC §3 /letters). */
export const ArchivedLetterRow: FC<{ letter: ArchivedLetter }> = ({ letter }) => (
  <li>
    <details className="group py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span>
          <LetterSubject subject={letter.subject} />
          <span className="font-mono text-xs uppercase text-bark">
            Written {formatDate(todayIn(letter.timeZone, letter.createdAt))}
            {letter.status === "UNDELIVERABLE" ? (
              <>
                {" · "}
                <span className="text-red">Undeliverable</span>
              </>
            ) : (
              letter.deliveredAt && ` · Arrived ${formatDate(todayIn(letter.timeZone, letter.deliveredAt))}`
            )}
          </span>
        </span>
        <span aria-hidden className="text-bark group-open:rotate-45 transition-transform">
          +
        </span>
      </summary>
      <p className="mt-4 whitespace-pre-wrap font-serif text-xl leading-relaxed">{letter.body}</p>
      <div className="mt-4">
        <ConfirmDelete letterId={letter.id} label="Delete" confirmLabel="Delete letter" />
      </div>
    </details>
  </li>
);
