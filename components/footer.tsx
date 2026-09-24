import Link from "next/link";
import type { FC } from "react";

export const Footer: FC = () => (
  <footer className="mx-auto flex w-full max-w-3xl flex-wrap gap-x-4 gap-y-2 px-6 pb-8 font-mono text-xs uppercase text-bark">
    <span>Kesho · letters to your future self</span>
    <Link href="/terms" className="hover:text-ink">
      Terms
    </Link>
    <Link href="/privacy" className="hover:text-ink">
      Privacy
    </Link>
    <a href="mailto:hello@kesho.et" className="hover:text-ink">
      hello@kesho.et
    </a>
  </footer>
);
