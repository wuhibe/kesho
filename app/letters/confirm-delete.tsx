"use client";

import { type FC, useActionState, useState } from "react";
import { Notice } from "@/components/notice";
import { dangerPill, ghostPill } from "@/components/pill";
import { deleteForAuthor } from "./delete-for-author";

/** A Cancel or Delete button with the inline "Delete forever?" confirm (SPEC §3 /letters). */
export const ConfirmDelete: FC<{ letterId: string; label: string; confirmLabel: string }> = ({
  letterId,
  label,
  confirmLabel,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, submit, isPending] = useActionState(() => deleteForAuthor(letterId), null);

  if (!isConfirming) {
    return (
      <button type="button" onClick={() => setIsConfirming(true)} className={`${ghostPill} py-2!`}>
        {label}
      </button>
    );
  }

  return (
    <form action={submit} className="flex flex-wrap items-center gap-2 text-sm">
      Delete forever?
      <button disabled={isPending} className={`${dangerPill} py-2!`}>
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setIsConfirming(false)} className={`${ghostPill} py-2!`}>
        Keep
      </button>
      {error && <Notice>{error}</Notice>}
    </form>
  );
};
