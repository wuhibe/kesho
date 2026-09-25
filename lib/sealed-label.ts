import { dayCount, daysBetween, formatDate, todayIn } from "./delivery-date.ts";
import type { SealedLetter } from "./letters.ts";

/** "Opens 24 Sept 2027 · 365 days", counted from the Author's local today (SPEC §3 /letters). */
export function sealedLabel(letter: Pick<SealedLetter, "status" | "deliveryDate" | "timeZone">, now: Date = new Date()): string {
  if (letter.status === "PENDING") return "Pending · verify your email";
  const days = daysUntil(letter, now);
  return arrivalNote(days) ?? `Opens ${formatDate(letter.deliveryDate)} · ${dayCount(days)}`;
}

/** Days until a Letter opens, from the Author's local today. */
export function daysUntil(letter: Pick<SealedLetter, "deliveryDate" | "timeZone">, now: Date = new Date()): number {
  return daysBetween(todayIn(letter.timeZone, now), letter.deliveryDate);
}

/**
 * Replaces the countdown once a Letter's date has come. It can pass while the Letter is still
 * sealed: the Author verified late, or the daily run is over quota and it waits a day (SPEC §7).
 */
export function arrivalNote(days: number): string | null {
  if (days < 0) return "On its way";
  if (days === 0) return "Opens today";
  return null;
}
