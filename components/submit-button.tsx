import type { FC, ReactNode } from "react";
import { inkPill } from "./pill";

export const SubmitButton: FC<{ isPending: boolean; children: ReactNode }> = ({ isPending, children }) => (
  <button disabled={isPending} className={`mt-2 ${inkPill}`}>
    {children}
  </button>
);
