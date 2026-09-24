import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { FC } from "react";
import { Envelope } from "@/components/envelope";
import { Notice } from "@/components/notice";
import { ghostPill, inkPill } from "@/components/pill";
import { auth } from "@/lib/auth";
import { LINK_EXPIRED_LOG_IN } from "@/lib/copy";
import { formatDate } from "@/lib/delivery-date";
import { findSealedLetter } from "@/lib/letters";
import { arrivalNote, dayCount, daysUntil } from "@/lib/sealed-label";
import { ClearDraft } from "./clear-draft";

export const metadata: Metadata = { title: "Sealed · Kesho" };

// Verification links land here (with ?error=… once expired or used), as does a log-in that sealed.
const SealedPage: FC<PageProps<"/sealed/[id]">> = async ({ params, searchParams }) => {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  if (error !== undefined) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 pb-24 pt-16 text-center">
        <Envelope stamp="Pending" />
        <Notice>{LINK_EXPIRED_LOG_IN}</Notice>
        <Link href="/?auth=login" className={inkPill}>
          Log in
        </Link>
      </main>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/?auth=login");
  const letter = await findSealedLetter(id, session.user.id);
  if (!letter) notFound();

  const days = daysUntil(letter);
  const note = arrivalNote(days);
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-16 text-center">
      <ClearDraft letterId={id} />
      <Envelope stamp="Sealed" note={`Do not open before ${formatDate(letter.deliveryDate)}`} />
      <h1 className="mt-10 text-5xl font-medium tracking-tight">
        {note ? (
          <span className="text-red">{note}.</span>
        ) : (
          <>
            See you in <span className="text-red">{dayCount(days)}.</span>
          </>
        )}
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink/70">
        You won&apos;t be able to read it until then. You can still cancel it from your letters.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={inkPill}>
          Write another
        </Link>
        <Link href="/letters" className={ghostPill}>
          My letters
        </Link>
      </div>
    </main>
  );
};

export default SealedPage;
