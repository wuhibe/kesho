import Link from "next/link";
import type { FC } from "react";

export const Footer: FC = () => (
  <footer className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 px-6 pb-5 font-mono text-xs uppercase text-bark">
    {/* Hidden below sm so Terms, Privacy and the email share one line. */}
    <span className="hidden sm:inline">Kesho · letters to your future self</span>
    <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-ink">
      Terms
    </Link>
    <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">
      Privacy
    </Link>
    <a href="mailto:hello@kesho.et" className="inline-flex min-h-11 items-center hover:text-ink">
      hello@kesho.et
    </a>
  </footer>
);
