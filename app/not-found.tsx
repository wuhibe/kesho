import type { Metadata } from "next";
import Link from "next/link";
import type { FC } from "react";
import { inkPill } from "@/components/pill";

export const metadata: Metadata = { title: "Not found · Kesho" };

// Unmatched URLs, and a /sealed/[id] Letter that was cancelled or isn't the Author's.
const NotFound: FC = () => (
  <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-16 text-center">
    <h1 className="text-5xl font-medium tracking-tight">Nothing here.</h1>
    <p className="mt-4 max-w-md text-lg text-ink/70">
      This page doesn&apos;t exist, or the letter was cancelled.
    </p>
    <Link href="/" className={`mt-8 ${inkPill}`}>
      Write a letter
    </Link>
  </main>
);

export default NotFound;
