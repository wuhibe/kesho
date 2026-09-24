"use client";

import Link from "next/link";
import { type FC, useActionState } from "react";
import { Field } from "@/components/field";
import { Heading } from "@/components/heading";
import { Lead } from "@/components/lead";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { authClient } from "@/lib/auth-client";
import { LINK_EXPIRED_RESET } from "@/lib/copy";
import { failure, type FormState, IDLE } from "@/lib/form-state";

export const NewPasswordForm: FC<{ token: string }> = ({ token }) => {
  const [result, submit, isPending] = useActionState(async (_: FormState, form: FormData): Promise<FormState> => {
    const { error } = await authClient.resetPassword({ newPassword: String(form.get("password")), token });
    if (error?.code === "INVALID_TOKEN") return { status: "error", message: LINK_EXPIRED_RESET };
    return error ? failure(error) : { status: "done" };
  }, IDLE);

  if (result.status === "done") {
    return (
      <>
        <Heading>Password changed.</Heading>
        <Lead>You&apos;re logged out everywhere. Log in with your new password.</Lead>
        <Link href="/" className="mt-6 inline-block text-sm font-medium underline">
          Log in →
        </Link>
      </>
    );
  }

  return (
    <form action={submit} className="flex flex-col gap-3">
      <Heading>Choose a new password.</Heading>
      <Lead>Your sealed letters are safe either way.</Lead>
      <Field label="New password (8+)" name="password" type="password" autoComplete="new-password" minLength={8} />
      {result.status === "error" && <Notice>{result.message}</Notice>}
      <SubmitButton isPending={isPending}>Save new password</SubmitButton>
    </form>
  );
};
