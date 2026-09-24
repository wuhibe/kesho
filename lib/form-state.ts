import { errorCopy, type RequestError } from "@/lib/copy";

/** The result of a client form that calls better-auth. */
export type FormState = { status: "idle" | "done" } | { status: "error"; message: string };

export const IDLE: FormState = { status: "idle" };

export function failure(error: RequestError): FormState {
  return { status: "error", message: errorCopy(error) };
}
