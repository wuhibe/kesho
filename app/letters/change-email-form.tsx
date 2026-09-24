"use client";

import { type FC, useActionState } from "react";
import { Field } from "@/components/field";
import { Lead } from "@/components/lead";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { authClient } from "@/lib/auth-client";
import { failure, type FormState, IDLE } from "@/lib/form-state";

/** better-auth mails a link to the new address; the email changes once it's clicked (SPEC §5 Email change). */
export const ChangeEmailForm: FC<{ currentEmail: string }> = ({ currentEmail }) => {
  const [result, submit, isPending] = useActionState(async (_: FormState, form: FormData): Promise<FormState> => {
    const { error } = await authClient.changeEmail({
      newEmail: String(form.get("email")),
      callbackURL: "/letters?email=changed",
    });
    return error ? failure(error) : { status: "done" };
  }, IDLE);

  if (result.status === "done") {
    return <Lead>Check your new inbox and click the link. Until then, your letters still go to {currentEmail}.</Lead>;
  }

  return (
    <form action={submit} className="flex max-w-sm flex-col gap-3">
      <Field label="New email" name="email" type="email" autoComplete="email" />
      {result.status === "error" && <Notice>{result.message}</Notice>}
      <SubmitButton isPending={isPending}>Send confirmation link</SubmitButton>
    </form>
  );
};
