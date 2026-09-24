"use client";

import { useRouter } from "next/navigation";
import { type FC, useActionState } from "react";
import { Field } from "@/components/field";
import { Lead } from "@/components/lead";
import { Notice } from "@/components/notice";
import { dangerPill } from "@/components/pill";
import { authClient } from "@/lib/auth-client";
import { failure, type FormState, IDLE } from "@/lib/form-state";

/** The password is the confirm; every Letter goes with the account (SPEC §5 Account deletion). */
export const DeleteAccountForm: FC = () => {
  const router = useRouter();
  const [result, submit, isPending] = useActionState(async (_: FormState, form: FormData): Promise<FormState> => {
    const { error } = await authClient.deleteUser({ password: String(form.get("password")) });
    if (error) return failure(error);
    router.replace("/");
    router.refresh();
    return { status: "done" };
  }, IDLE);

  return (
    <form action={submit} className="flex max-w-sm flex-col gap-3">
      <Lead>
        This deletes your account and every letter in it, sealed or archived. Sealed letters will never arrive. It
        can&apos;t be undone.
      </Lead>
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      {result.status === "error" && <Notice>{result.message}</Notice>}
      <button disabled={isPending} className={`mt-2 ${dangerPill}`}>
        Delete account forever
      </button>
    </form>
  );
};
