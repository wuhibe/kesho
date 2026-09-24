import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { FC } from "react";
import { Notice } from "@/components/notice";
import { ghostPill, inkPill } from "@/components/pill";
import { auth } from "@/lib/auth";
import { EMAIL_CHANGED, SOMETHING_WENT_WRONG } from "@/lib/copy";
import { listLetters } from "@/lib/letters";
import { LETTER_CAP } from "@/lib/seal-rules";
import { ArchivedLetterRow } from "./archived-letter-row";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountForm } from "./delete-account-form";
import { SealedLetterRow } from "./sealed-letter-row";

export const metadata: Metadata = { title: "Your letters · Kesho" };

const sectionLabel = "mt-12 font-mono text-xs uppercase text-bark";
const rows = "mt-4 divide-y divide-ink/10 border-y border-ink/10";
const accountSummary = `inline-block cursor-pointer list-none [&::-webkit-details-marker]:hidden ${ghostPill}`;

// A confirmed change-email link lands here with ?email=changed, plus &error=… once expired or used.
const LettersPage: FC<PageProps<"/letters">> = async ({ searchParams }) => {
  const [{ email, error }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!session) redirect("/?auth=login");
  const { sealed, archive } = await listLetters(session.user.id);
  const emailNotice = email === "changed" && (error === undefined ? EMAIL_CHANGED : SOMETHING_WENT_WRONG);

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
      <p className="mt-2 text-sm text-bark">Letters arrive at {session.user.email}.</p>
      <div className="mt-4 flex flex-col gap-4">
        <details>
          <summary className={accountSummary}>Change email</summary>
          <div className="mt-4">
            <ChangeEmailForm currentEmail={session.user.email} />
          </div>
        </details>
        <details>
          <summary className={accountSummary}>Change password</summary>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </details>
        <details>
          <summary className={`${accountSummary} text-red`}>Delete account</summary>
          <div className="mt-4">
            <DeleteAccountForm />
          </div>
        </details>
      </div>
    </main>
  );
};

export default LettersPage;
