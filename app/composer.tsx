"use client";

import { type FC, useState, useTransition } from "react";
import { Notice } from "@/components/notice";
import { inkPill } from "@/components/pill";
import { formatDate } from "@/lib/delivery-date";
import { BODY_MAX, type LetterInput, SUBJECT_MAX } from "@/lib/letter-input";
import { type AuthMode, AuthModal } from "./auth-modal";
import { DeliveryPicker } from "./delivery-picker";
import { deliveryDateOf, updateDraft, useDraft } from "./draft";
import { localTimeZone, useLocalToday } from "./local-today";
import { sealForAuthor } from "./seal-for-author";

/** The letter sheet and send bar (SPEC §3 `/`, Variant A). */
export const Composer: FC<{ isSignedIn: boolean; openAuth: AuthMode | null }> = ({ isSignedIn, openAuth }) => {
  const draft = useDraft();
  const today = useLocalToday();
  const [authMode, setAuthMode] = useState(openAuth);
  const [error, setError] = useState<string | null>(null);
  const [isSealing, startSealing] = useTransition();

  const deliveryDate = today && deliveryDateOf(draft, today);
  const letter: LetterInput | null =
    deliveryDate && draft.body.trim()
      ? { id: draft.id, subject: draft.subject, body: draft.body, deliveryDate, timeZone: localTimeZone() }
      : null;
  const wordCount = draft.body.split(/\s+/).filter(Boolean).length;

  const sealOrAskAuth = () => {
    if (!isSignedIn) return setAuthMode("signup");
    startSealing(async () => setError(await sealForAuthor(letter)));
  };

  return (
    <>
      <section className="mt-10 rounded-[28px] bg-paper px-6 py-8 shadow-float md:px-14 md:py-14">
        <p className="min-h-4 font-mono text-xs uppercase tracking-[0.2em] text-bark">{today && formatDate(today)}</p>
        <input
          aria-label="Subject (optional)"
          placeholder="Subject (optional)"
          maxLength={SUBJECT_MAX}
          value={draft.subject}
          onChange={(event) => updateDraft({ subject: event.target.value })}
          className="mt-6 w-full border-b border-ink/10 bg-transparent pb-2 text-3xl font-medium tracking-tight placeholder:text-ink/30"
        />
        <p className="mt-8 font-script text-5xl">Dear future self,</p>
        <textarea
          aria-label="Your letter"
          placeholder="Start writing…"
          maxLength={BODY_MAX}
          value={draft.body}
          onChange={(event) => updateDraft({ body: event.target.value })}
          className="field-sizing-content mt-4 min-h-120 w-full resize-none border-b border-transparent bg-transparent bg-[repeating-linear-gradient(transparent,transparent_39px,rgb(33_12_2/0.08)_40px)] font-serif text-2xl leading-10 placeholder:text-ink/30"
        />
        <p className="mt-2 text-right font-mono text-xs uppercase text-bark">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </p>
      </section>

      {/* data-send-bar: the root layout pads the page for this bar while it floats (md+). */}
      <div
        data-send-bar
        className="mt-6 flex flex-col gap-4 rounded-2xl bg-cream/95 p-4 shadow-float md:fixed md:inset-x-6 md:bottom-6 md:z-10 md:mx-auto md:max-w-3xl md:flex-row md:items-center md:justify-between md:px-6">
        <DeliveryPicker draft={draft} today={today} deliveryDate={deliveryDate} />
        <div className="flex flex-col gap-2 md:items-end">
          <button type="button" disabled={!letter || isSealing} onClick={sealOrAskAuth} className={`shrink-0 ${inkPill}`}>
            Send to the future →
          </button>
          {error && <Notice>{error}</Notice>}
        </div>
      </div>

      {authMode && <AuthModal initialMode={authMode} letter={letter} onClose={() => setAuthMode(null)} />}
    </>
  );
};
