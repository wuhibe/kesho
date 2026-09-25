import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { auth } from "@/lib/auth";
import { LogInButton } from "./log-in-button";
import { LogOutButton } from "./log-out-button";
import { headerLink } from "./header-link";

/**
 * On every page, in the footer's register; it scrolls away with the page (SPEC §3). The type
 * styles sit on each link, since the log-in modal renders inside the header.
 */
export const SiteHeader: FC = async () => {
  // The root layout sits outside every error boundary, so a failed lookup shows Log in rather
  // than taking down every page; pages that need the session still surface the failure.
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-3">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 px-2 font-mono text-xs uppercase text-ink">
        <Image src="/icon.svg" alt="" width={20} height={20} />
        Kesho
      </Link>
      <nav className="flex items-center gap-1">
        {session ? (
          <>
            <Link href="/letters" className={headerLink}>
              Your letters
            </Link>
            <LogOutButton />
          </>
        ) : (
          <LogInButton />
        )}
      </nav>
    </header>
  );
};
