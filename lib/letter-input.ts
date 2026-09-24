import { chosenDeliveryDate, todayIn } from "./delivery-date.ts";

export const SUBJECT_MAX = 150;
export const BODY_MAX = 20_000;

/** A Letter as the composer submits it, checked and ready to seal. */
export type LetterInput = {
  /** Chosen by the browser so re-sending the same draft never makes a second Letter. */
  id: string;
  subject: string | null;
  body: string;
  deliveryDate: string;
  timeZone: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Returns null unless the input is a Letter we can seal (SPEC §5 Create). */
export function parseLetterInput(raw: unknown, now: Date = new Date()): LetterInput | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { id, subject, body, deliveryDate, timeZone } = raw as Record<string, unknown>;

  if (typeof id !== "string" || !UUID.test(id)) return null;
  if (subject !== undefined && (typeof subject !== "string" || subject.length > SUBJECT_MAX)) return null;
  if (typeof body !== "string" || !body.trim() || body.length > BODY_MAX) return null;
  if (typeof timeZone !== "string" || !isTimeZone(timeZone)) return null;
  if (typeof deliveryDate !== "string") return null;
  if (chosenDeliveryDate(todayIn(timeZone, now), { date: deliveryDate }) === null) return null;

  return { id, subject: subject?.trim() || null, body, deliveryDate, timeZone };
}

function isTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
