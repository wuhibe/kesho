"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FC, useActionState, useEffect, useRef, useState } from "react";
import { Field } from "@/components/field";
import { Notice } from "@/components/notice";
import { segment } from "@/components/pill";
import { SubmitButton } from "@/components/submit-button";
import { authClient } from "@/lib/auth-client";
import { ACCOUNT_EXISTS_CODE, errorCopy } from "@/lib/copy";
import { formatDate } from "@/lib/delivery-date";
import type { LetterInput } from "@/lib/letter-input";
import { rememberInboxEmail } from "./check-inbox/inbox-email";
import { draftIdFor } from "./draft";

export type AuthMode = "signup" | "login";

/**
 * "Where should it arrive?" The Letter travels with sign-up or log-in and is sealed by the
 * auth hooks in lib/auth.ts, PENDING until the email is verified (SPEC §3, §5).
 */
export const AuthModal: FC<{ initialMode: AuthMode; letter: LetterInput | null; onClose: () => void }> = ({
  initialMode,
  letter,
  onClose,
}) => {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState(initialMode);
  const isSignUp = mode === "signup";

  useEffect(() => dialog.current?.showModal(), []);

  // React resets the form after each try, so the email comes back through state.
  const [result, submit, isPending] = useActionState(
    async (_: { email: string; error: string | null }, form: FormData) => {
      const email = String(form.get("email"));
      const password = String(form.get("password"));
      const sent = letter && { ...letter, id: draftIdFor(email) };
      // Where the emailed verification link, or a verified log-in, lands.
      const callbackURL = sent ? `/sealed/${sent.id}` : "/";
      const { error } = await authClient.$fetch<unknown, { code?: string }>(
        isSignUp ? "/sign-up/email" : "/sign-in/email",
        { method: "POST", body: { ...(isSignUp && { name: "" }), email, password, callbackURL, letter: sent } },
      );

      const awaitsVerification = isSignUp ? !error : error?.code === "EMAIL_NOT_VERIFIED";
      if (awaitsVerification) {
        rememberInboxEmail(email);
        router.push("/check-inbox");
        return { email, error: null };
      }
      // The Letter stays in the modal, so logging in seals it.
      if (error?.code === ACCOUNT_EXISTS_CODE) setMode("login");
      // A verified log-in needs nothing more: better-auth's client follows its callbackURL.
      return { email, error: error ? errorCopy(error) : null };
    },
    { email: "", error: null },
  );

  return (
    <dialog
      ref={dialog}
      aria-labelledby="auth-title"
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
      className="m-auto w-[calc(100%-3rem)] max-w-md rounded-4xl bg-paper text-ink shadow-float backdrop:bg-ink/60"
    >
      <div className="relative p-8">
        <h2 id="auth-title" className="pr-8 text-3xl font-medium tracking-tight">
          Where should it arrive?
        </h2>
        {letter && (
          <p className="mb-6 mt-2 text-ink/70">
            Arrives {formatDate(letter.deliveryDate)}. We&apos;ll only ever send it to you.
          </p>
        )}
        <form action={submit} className="mt-4 flex flex-col gap-3">
          <div role="group" aria-label="Account" className="flex rounded-full bg-sand/60 p-1 text-sm">
            <button type="button" aria-pressed={isSignUp} onClick={() => setMode("signup")} className={segment(isSignUp)}>
              New here
            </button>
            <button type="button" aria-pressed={!isSignUp} onClick={() => setMode("login")} className={segment(!isSignUp)}>
              I have an account
            </button>
          </div>
          <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={result.email} />
          <Field
            label={isSignUp ? "Choose a password (8+)" : "Password"}
            name="password"
            type="password"
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          {!isSignUp && (
            <Link href="/reset-password" className="self-end text-sm text-muted underline">
              Forgot password?
            </Link>
          )}
          {result.error && <Notice>{result.error}</Notice>}
          <SubmitButton isPending={isPending}>
            {isSignUp ? "Create account" : "Log in"}
            {letter && " & seal letter"}
          </SubmitButton>
          {isSignUp && (
            <p className="text-xs text-ink/60">
              We&apos;ll email you a link to confirm it&apos;s you. Your letter waits until you click it. By
              continuing you confirm you&apos;re 16+ and agree to the{" "}
              <Link href="/terms" className="underline">
                Terms
              </Link>
              .
            </p>
          )}
        </form>
        {/* Last in the markup so showModal focuses the form, not Close. */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialog.current?.close()}
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full text-2xl leading-none text-ink/60 transition-colors hover:bg-sand/60 hover:text-ink"
        >
          ×
        </button>
      </div>
    </dialog>
  );
};
