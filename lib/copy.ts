// User-facing error copy from SPEC §3. None of it reveals whether an account exists.

export const LETTER_CAP_REACHED =
  "You have 20 sealed letters, the most we hold at once. Let one arrive or cancel one to write another.";
export const LINK_EXPIRED_LOG_IN = "This link has expired. Log in and we'll send a fresh one.";
export const RATE_LIMITED = "Too many tries. Wait a minute and try again.";
export const SOMETHING_WENT_WRONG = "Something went wrong. Try again.";
export const WRONG_CREDENTIALS = "That email and password don't match.";

/** The error code better-auth returns when sealing hits the 20-letter cap. */
export const LETTER_CAP_CODE = "LETTER_CAP";

/** The copy for a failed auth or sealing request. */
export function errorCopy(error: { status: number; code?: string }): string {
  if (error.code === LETTER_CAP_CODE) return LETTER_CAP_REACHED;
  if (error.status === 401) return WRONG_CREDENTIALS;
  if (error.status === 429) return RATE_LIMITED;
  return SOMETHING_WENT_WRONG;
}
