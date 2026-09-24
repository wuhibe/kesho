import { errorCopy } from "@/lib/copy";

export type FormState = { status: "idle" | "done" } | { status: "error"; message: string };

export const IDLE: FormState = { status: "idle" };
export const EXPIRED = "This link has expired. Enter your email and we'll send a fresh one.";

export function failure(httpStatus: number): FormState {
  return { status: "error", message: errorCopy({ status: httpStatus }) };
}
