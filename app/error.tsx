"use client";

import type { FC } from "react";
import { inkPill } from "@/components/pill";

// Nothing is logged here: the server already logs the error, and the browser only sees its digest.
const ErrorPage: FC<{ retry: () => void }> = ({ retry }) => (
  <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-16 text-center">
    {/* "Something went wrong. Try again." (SPEC §3), with the retry as the button. */}
    <h1 className="text-5xl font-medium tracking-tight">Something went wrong.</h1>
    <button type="button" onClick={retry} className={`mt-8 ${inkPill}`}>
      Try again
    </button>
  </main>
);

export default ErrorPage;
