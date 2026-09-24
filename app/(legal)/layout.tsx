import type { FC, ReactNode } from "react";

// Plain-English pages, not reviewed by a lawyer (SPEC §9). The outlines are in issue #12.
const LegalLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <main className="mx-auto max-w-2xl px-6 pb-16 pt-16 leading-relaxed text-ink/80 [&_a]:underline [&_b]:font-medium [&_b]:text-ink [&_h1]:text-5xl [&_h1]:font-medium [&_h1]:tracking-tight [&_h1]:text-ink [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
    {children}
    <div className="mt-12 border-t border-ink/10 pt-6 text-sm">
      Kesho is a personal project run by Wuhibe Tamire, Addis Ababa, Ethiopia. Contact:{" "}
      <a href="mailto:hello@kesho.et">hello@kesho.et</a>.
      <div className="mt-2 font-mono text-xs uppercase text-bark">Last updated 24 Sept 2026</div>
    </div>
  </main>
);

export default LegalLayout;
