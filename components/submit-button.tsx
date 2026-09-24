import type { FC, ReactNode } from "react";

export const SubmitButton: FC<{ isPending: boolean; children: ReactNode }> = ({ isPending, children }) => (
  <button
    disabled={isPending}
    className="mt-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85 disabled:bg-sand disabled:text-bark"
  >
    {children}
  </button>
);
