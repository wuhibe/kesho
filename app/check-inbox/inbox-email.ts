import { useSyncExternalStore } from "react";

// Kept in sessionStorage rather than the URL so the address never lands in request logs.
const KEY = "kesho:inbox-email";

export function rememberInboxEmail(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Blocked storage: /check-inbox falls back to "your email".
  }
}

/** Null on the server, or when this tab never sent a verification email. */
export function useInboxEmail(): string | null {
  return useSyncExternalStore(noop, readEmail, () => null);
}

function readEmail(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function noop(): () => void {
  return () => {};
}
