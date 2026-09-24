"use client";

import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import { Notice } from "@/components/notice";
import { ghostPill } from "@/components/pill";
import { authClient } from "@/lib/auth-client";
import { errorCopy } from "@/lib/copy";
import { readDraft } from "../draft";
import { useInboxEmail } from "./inbox-email";

const COOLDOWN_S = 30;

/** The echoed email, Resend (30 s cooldown) and "Wrong email?" (SPEC §3 /check-inbox). */
export const InboxActions: FC = () => {
  const router = useRouter();
  const email = useInboxEmail();
  // A link was just sent, so the cooldown starts at once.
  const [cooldownS, setCooldownS] = useState(COOLDOWN_S);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownS === 0) return;
    const timer = setTimeout(() => setCooldownS(cooldownS - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownS]);

  const resend = async () => {
    if (!email) return;
    setCooldownS(COOLDOWN_S);
    const { id } = readDraft();
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: id ? `/sealed/${id}` : "/" });
    setError(error ? errorCopy(error) : null);
  };

  return (
    <>
      <p className="mt-4 max-w-md text-lg text-ink/70">
        We sent a link to {email ? <b className="text-ink">{email}</b> : "your email"}. Click it to seal your letter.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {email && (
          <button type="button" disabled={cooldownS > 0} onClick={resend} className={ghostPill}>
            {cooldownS > 0 ? `Resend in ${cooldownS}s` : "Resend email"}
          </button>
        )}
        <button type="button" onClick={() => router.push("/?auth=signup")} className={ghostPill}>
          Wrong email?
        </button>
      </div>
      {error && (
        <div className="mt-4">
          <Notice>{error}</Notice>
        </div>
      )}
    </>
  );
};
