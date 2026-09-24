// Calendar-day math for Delivery dates. Dates are "YYYY-MM-DD" strings: a Delivery date is a
// day in the Author's timezone, not an instant (ADR 0001).

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_MONTHS_AHEAD = 5 * 12;

/** Today's date as the Author sees it in their IANA timezone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * A Letter is due once its Delivery date has come in the Author's timezone, so it can arrive
 * late on the right day but never a day early (ADR 0001).
 */
export function isDue(letter: { deliveryDate: string; timeZone: string }, now: Date): boolean {
  return todayIn(letter.timeZone, now) >= letter.deliveryDate;
}

/** The Delivery dates an Author can pick: tomorrow up to five years out (SPEC §5). */
export function deliveryDateRange(today: string): { min: string; max: string } {
  return { min: addDays(today, 1), max: addMonths(today, MAX_MONTHS_AHEAD) };
}

/**
 * The Delivery date an Author picked: a preset months ahead, or their own date, which is
 * null while missing or outside the range.
 */
export function chosenDeliveryDate(today: string, choice: { months: number } | { date: string }): string | null {
  if ("months" in choice) return addMonths(today, choice.months);
  const { min, max } = deliveryDateRange(today);
  return isCalendarDate(choice.date) && choice.date >= min && choice.date <= max ? choice.date : null;
}

/** Clamps to the month's last day, so 31 Aug + 6 months is 28 Feb, not 3 March. */
export function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month - 1 + months + 1, 0)).getUTCDate();
  return toDate(Date.UTC(year, month - 1 + months, Math.min(day, lastDay)));
}

export function addDays(date: string, days: number): string {
  return toDate(fromDate(date) + days * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((fromDate(to) - fromDate(from)) / DAY_MS);
}

export function isCalendarDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toDate(fromDate(value)) === value;
}

/** "24 Sept 2027", the same on server and browser. */
export function formatDate(date: string): string {
  return new Date(fromDate(date)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Sept 2026", as the delivery email signs it (SPEC §8). */
export function formatMonth(date: string): string {
  return new Date(fromDate(date)).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
}

/** The Postgres `date` column's value: midnight UTC on that day. */
export function toUtcDate(date: string): Date {
  return new Date(fromDate(date));
}

export function fromUtcDate(value: Date): string {
  return toDate(value.getTime());
}

function fromDate(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function toDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
