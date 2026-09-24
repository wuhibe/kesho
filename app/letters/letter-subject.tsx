import type { FC } from "react";

export const LetterSubject: FC<{ subject: string | null }> = ({ subject }) => (
  <span className="block font-medium">{subject ?? <span className="text-ink/50">Untitled letter</span>}</span>
);
