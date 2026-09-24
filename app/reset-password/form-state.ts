export type FormState = { status: "idle" | "done" } | { status: "error"; message: string };

export const IDLE: FormState = { status: "idle" };
export const EXPIRED = "This link has expired. Enter your email and we'll send a fresh one.";

// Copy strings from SPEC §3.
export function failure(httpStatus: number): FormState {
  if (httpStatus === 429) return { status: "error", message: "Too many tries. Wait a minute and try again." };
  return { status: "error", message: "Something went wrong. Try again." };
}
