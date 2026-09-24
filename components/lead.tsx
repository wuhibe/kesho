import type { FC, ReactNode } from "react";

export const Lead: FC<{ children: ReactNode }> = ({ children }) => <p className="mb-3 mt-2 text-ink/70">{children}</p>;
