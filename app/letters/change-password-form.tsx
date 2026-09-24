"use client";

import { type FC, useActionState } from "react";
import { Field } from "@/components/field";
import { Lead } from "@/components/lead";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { authClient } from "@/lib/auth-client";
import { failure, type FormState, IDLE } from "@/lib/form-state";

export const ChangePasswordForm: FC = () => {
  const [result, submit, isPending] = useActionState(async (_: FormState, form: FormData): Promise<FormState> => {
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("current")),
      newPassword: String(form.get("password")),
      revokeOtherSessions: true,
    });
    return error ? failure(error) : { status: "done" };
  }, IDLE);

  if (result.status === "done") return <Lead>Password changed. You&apos;re logged out everywhere else.</Lead>;

  return (
    <form action={submit} className="flex max-w-sm flex-col gap-3">
      <Field label="Current password" name="current" type="password" autoComplete="current-password" />
      <Field label="New password (8+)" name="password" type="password" autoComplete="new-password" minLength={8} />
      {result.status === "error" && <Notice>{result.message}</Notice>}
      <SubmitButton isPending={isPending}>Save new password</SubmitButton>
    </form>
  );
};
