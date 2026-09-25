import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { FC } from "react";
import { Notice } from "@/components/notice";
import { inkPill } from "@/components/pill";
import { auth } from "@/lib/auth";
import { EMAIL_CHANGED, SOMETHING_WENT_WRONG } from "@/lib/copy";
import { listLetters } from "@/lib/letters";
import { LETTER_CAP } from "@/lib/seal-rules";
import { AccountSettings } from "./account-settings";
import { ArchivedLetterRow } from "./archived-letter-row";
import { SealedLetterRow } from "./sealed-letter-row";

export const metadata: Metadata = { title: "Your letters", robots: { index: false } };

const sectionLabel = "mt-12 font-mono text-xs uppercase text-bark";
const rows = "mt-4 divide-y divide-ink/10 border-y border-ink/10";

// A confirmed change-email link lands here with ?email=changed, plus &error=… once expired or used.
const LettersPage: FC<PageProps<"/letters">> = async ({ searchParams }) => {
  const [{ email, error }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!session) redirect("/?auth=login");
  const { sealed, archive } = await listLetters(session.user.id);
  const emailNotice = email === "changed" && (error === undefined ? EMAIL_CHANGED : SOMETHING_WENT_WRONG);
  // Verifying a new email requeues Undeliverable Letters, so the banner opens Change email.
  const hasUndeliverable = archive.some((letter) => letter.status === "UNDELIVERABLE");

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-5xl font-medium tracking-tight">Your letters</h1>
        <Link href="/" className={inkPill}>
          Write a letter
        </Link>
      </div>
      {emailNotice && (
        <div className="mt-8">
          <Notice>{emailNotice}</Notice>
        </div>
      )}
      {hasUndeliverable && (
        <p className="mt-8 rounded-xl bg-paper p-4 text-sm shadow-float">
          <b>One letter couldn&apos;t reach you.</b> Your email bounced.{" "}
          <Link href="/letters?settings=email" scroll={false} className="text-red underline">
            Update your email
          </Link>{" "}
          and we&apos;ll send it again.
        </p>
      )}

      <h2 className={sectionLabel}>
        Sealed · {sealed.length} of {LETTER_CAP}
      </h2>
      {sealed.length === 0 ? (
        <p className="mt-4 text-lg text-ink/70">Nothing sealed yet. Future you is waiting.</p>
      ) : (
        <ul className={rows}>
          {sealed.map((letter) => (
            <SealedLetterRow key={letter.id} letter={letter} />
          ))}
        </ul>
      )}

      {archive.length > 0 && (
        <>
          <h2 className={sectionLabel}>Archive</h2>
          <ul className={rows}>
            {archive.map((letter) => (
              <ArchivedLetterRow key={letter.id} letter={letter} />
            ))}
          </ul>
        </>
      )}

      <h2 className={sectionLabel}>Account</h2>
      <AccountSettings email={session.user.email} />
    </main>
  );
};

export default LettersPage;
