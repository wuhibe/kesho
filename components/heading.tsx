import type { FC, ReactNode } from "react";

export const Heading: FC<{ children: ReactNode }> = ({ children }) => (
  <h1 className="text-3xl font-medium tracking-tight">{children}</h1>
);
