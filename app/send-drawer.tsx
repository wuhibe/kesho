"use client";

import { type FC, type ReactNode, useEffect, useRef } from "react";
import { inkPill } from "@/components/pill";

/**
 * Phones only (below md): a floating Send button opens the Delivery date and Send in a bottom
 * drawer (SPEC §3 `/`). A modal <dialog> moves focus in on open and closes on Esc.
 */
export const SendDrawer: FC<{ children: ReactNode }> = ({ children }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const close = () => dialog.current?.close();

  // Past md the drawer is display:none, and a hidden open modal would leave the page inert.
  useEffect(() => {
    const md = matchMedia("(min-width: 48rem)");
    const closeOnWide = () => md.matches && dialog.current?.close();
    md.addEventListener("change", closeOnWide);
    return () => md.removeEventListener("change", closeOnWide);
  }, []);

  return (
    <div className="md:hidden">
      <button
        ref={opener}
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`fixed bottom-5 right-5 z-10 shadow-float ${inkPill}`}
      >
        Send to the future →
      </button>
      <dialog
        ref={dialog}
        aria-label="Send to the future"
        // The dialog only restores focus to what was focused before, and Safari never focuses a tapped button.
        onClose={() => opener.current?.focus()}
        onClick={(event) => event.target === event.currentTarget && close()}
        className="mt-auto w-full max-w-none rounded-t-2xl bg-cream text-ink shadow-float backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-4 p-4 pb-6">
          <button type="button" onClick={close} className="self-end font-mono text-xs uppercase text-bark hover:text-ink">
            Hide
          </button>
          {children}
        </div>
      </dialog>
    </div>
  );
};
