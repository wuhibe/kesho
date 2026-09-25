// User-facing copy strings from SPEC §3. Only sign-up reveals whether an account exists (ADR 0003).

export const LETTER_CAP_REACHED =
  "You have 20 sealed letters, the most we hold at once. Let one arrive or cancel one to write another.";
export const LINK_EXPIRED_LOG_IN = "This link has expired. Log in and we'll send a fresh one.";
// On /reset-password, where logging in isn't an option.
export const LINK_EXPIRED_RESET = "This link has expired. Enter your email and we'll send a fresh one.";
export const RATE_LIMITED = "Too many tries. Wait a minute and try again.";
export const SOMETHING_WENT_WRONG = "Something went wrong. Try again.";
export const EMAIL_CHANGED = "Your sealed letters will now arrive at the new address.";
export const WRONG_CREDENTIALS = "That email and password don't match.";
export const ACCOUNT_EXISTS = "You already have an account. Log in or reset your password.";
// Signed in, changing password or deleting the account: there's no email to match.
export const WRONG_PASSWORD = "That password isn't right.";

/** The error code better-auth returns when sealing hits the 20-letter cap. */
export const LETTER_CAP_CODE = "LETTER_CAP";
/** The error code sign-up returns for a taken email. */
export const ACCOUNT_EXISTS_CODE = "ACCOUNT_EXISTS";

/** A failed better-auth request, as its client reports it. */
export type RequestError = { status: number; code?: string };

/** The copy for a failed auth or sealing request. */
export function errorCopy(error: RequestError): string {
  if (error.code === LETTER_CAP_CODE) return LETTER_CAP_REACHED;
  if (error.code === ACCOUNT_EXISTS_CODE) return ACCOUNT_EXISTS;
  if (error.status === 401) return WRONG_CREDENTIALS;
  if (error.code === "INVALID_PASSWORD") return WRONG_PASSWORD;
  if (error.status === 429) return RATE_LIMITED;
  return SOMETHING_WENT_WRONG;
}
