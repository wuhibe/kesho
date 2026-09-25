"use client";

import { useRouter } from "next/navigation";
import { type FC, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { clearDraft } from "./draft";
import { headerLink } from "./header-link";

/** Clears the Draft too, so a shared computer never shows the last Author's words (SPEC §6). */
export const LogOutButton: FC = () => {
  const router = useRouter();
  const [isPending, startLogOut] = useTransition();

  const logOut = () =>
    startLogOut(async () => {
      // Cleared first: even if signing out fails, the Draft is gone from this computer.
      clearDraft();
      const { error } = await authClient.signOut();
      // Still signed in, so stay put; the button is live again to retry.
      if (error) return;
      router.replace("/");
      router.refresh();
    });

  return (
    <button type="button" disabled={isPending} onClick={logOut} className={headerLink}>
      Log out
    </button>
  );
};
