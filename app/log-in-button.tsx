"use client";

import { type FC, useState } from "react";
import { AuthModal } from "./auth-modal";
import { headerLink } from "./header-link";

/** A plain log-in with no Letter to seal; it lands on /letters (SPEC §3). */
export const LogInButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={headerLink}>
        Log in
      </button>
      {isOpen && <AuthModal initialMode="login" letter={null} onClose={() => setIsOpen(false)} />}
    </>
  );
};
