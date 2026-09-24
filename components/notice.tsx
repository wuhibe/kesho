import type { FC, ReactNode } from "react";

export const Notice: FC<{ children: ReactNode }> = ({ children }) => (
  <p role="alert" className="text-sm text-ink">
    {children}
  </p>
);
