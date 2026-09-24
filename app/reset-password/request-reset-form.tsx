"use client";

import { type FC, useActionState } from "react";
import { Field } from "@/components/field";
import { Heading } from "@/components/heading";
import { Lead } from "@/components/lead";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { authClient } from "@/lib/auth-client";
import { EXPIRED, failure, type FormState, IDLE } from "./form-state";

export const RequestResetForm: FC<{ hasExpiredLink: boolean }> = ({ hasExpiredLink }) => {
  const [result, submit, isPending] = useActionState(async (_: FormState, form: FormData): Promise<FormState> => {
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/reset-password",
    });
    return error ? failure(error.status) : { status: "done" };
  }, IDLE);

  // Same message whether or not the account exists (SPEC §3).
  if (result.status === "done") {
    return (
      <>
        <Heading>Check your inbox.</Heading>
        <Lead>If that email has a Kesho account, a link to choose a new password is on its way. It expires in 1 hour.</Lead>
      </>
    );
  }

  return (
    <form action={submit} className="flex flex-col gap-3">
      <Heading>Forgot your password?</Heading>
      <Lead>Enter your email and we&apos;ll send a link to choose a new one. Your sealed letters are safe either way.</Lead>
      {hasExpiredLink && <Notice>{EXPIRED}</Notice>}
      <Field label="Email" name="email" type="email" autoComplete="email" />
      {result.status === "error" && <Notice>{result.message}</Notice>}
      <SubmitButton isPending={isPending}>Send reset link</SubmitButton>
    </form>
  );
};
