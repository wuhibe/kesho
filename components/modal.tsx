"use client";

import { type FC, type ReactNode, type RefObject, useEffect, useId, useRef } from "react";

/**
 * A centred native <dialog>: ×, Esc and a backdrop tap close it. Pass `dialogRef` to close it
 * from inside (SPEC §3 Auth modal, Account).
 */
export const Modal: FC<{
  title: string;
  onClose: () => void;
  dialogRef?: RefObject<HTMLDialogElement | null>;
  children: ReactNode;
}> = ({ title, onClose, dialogRef, children }) => {
  const ownRef = useRef<HTMLDialogElement>(null);
  const dialog = dialogRef ?? ownRef;
  const titleId = useId();

  useEffect(() => dialog.current?.showModal(), [dialog]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
      className="m-auto w-[calc(100%-3rem)] max-w-md rounded-4xl bg-paper text-ink shadow-float backdrop:bg-ink/60"
    >
      <div className="relative p-8">
        <h2 id={titleId} className="pr-8 text-3xl font-medium tracking-tight">
          {title}
        </h2>
        {children}
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
