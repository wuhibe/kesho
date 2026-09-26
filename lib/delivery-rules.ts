import type { WebhookEventPayload } from "resend";
import type { Letter } from "@/lib/generated/prisma/client";
import { isCalendarDate } from "./delivery-date.ts";
import type { OpsEmail, SendResult } from "./email.ts";

// Pure rules for the daily delivery run (SPEC §7), kept apart from the DB so they can be tested.

/** Resend Free's daily limit, shared by every email Kesho sends (SPEC §2). */
const DAILY_EMAIL_LIMIT = 100;
/** Leaves room under the daily limit for the day's account emails. */
const RUN_CAP = 90;
/** About two days of runs at up to six sends a day, enough to ride out a Resend outage. */
const MAX_ATTEMPTS = 12;
/** Before retrying, so a brief Resend outage can pass. */
export const RETRY_DELAY_MS = 2 * 60 * 1000;
// ponytail: Hobby stops a function at 300 s; a send takes ~1 s with its 500 ms gap. The margin covers
// cold start and rate-limit backoffs. Pro's 800 s limit if retries need more room.
const RUN_DEADLINE_MS = 270 * 1000;
const SEND_ESTIMATE_MS = 1000;
/** The last daily delivery run (vercel.json); the failure report judges due-ness as of this hour. */
const LAST_RUN_HOUR_UTC = 8;

/** A claimed Letter's next state once its send is done. */
export type DeliveryUpdate =
  | { status: "DELIVERED"; resendEmailId: string; lastError: null }
  | { status: "SCHEDULED" | "UNDELIVERABLE"; attempts: number; lastError?: string };

/** A Letter the failure report lists: ids, statuses and errors only, never content or emails. */
export type UndeliveredLetter = Pick<Letter, "id" | "status" | "attempts" | "lastError">;

/** What a Resend event says about a delivered email: hard means it will never arrive. */
export type Bounce = { emailId: string; isHard: boolean; error: string };

/**
 * When this run happens: now, or outside production a `?now=YYYY-MM-DD` override, taken at the
 * cron's 06:00 UTC. Null for an override that isn't a date.
 */
export function runTime(
  override: string | null,
  env: Record<string, string | undefined> = process.env,
  now: Date = new Date(),
): Date | null {
  if (override === null || env.VERCEL_ENV === "production") return now;
  return isCalendarDate(override) ? new Date(`${override}T06:00:00Z`) : null;
}

/** How many Letters this run may send: min(90, 100 − emails sent today). */
export function runBudget(sentToday: number): number {
  return Math.max(0, Math.min(RUN_CAP, DAILY_EMAIL_LIMIT - sentToday));
}

/**
 * The Resend idempotency key for one attempt at a Letter (SPEC §7 step 6). The environment keeps a
 * local or preview run on copied data from spending production's key, which Resend holds for 24 h.
 */
export function idempotencyKey(env: string | undefined, id: string, attempts: number): string {
  return `${env ?? "local"}/delivery/${id}/${attempts}`;
}

/** How many failed Letters a run can still retry after the wait without passing Hobby's 300 s (SPEC §7 step 8). */
export function retryBudget(failed: number, elapsedMs: number): number {
  const room = Math.floor((RUN_DEADLINE_MS - elapsedMs - RETRY_DELAY_MS) / SEND_ESTIMATE_MS);
  return Math.max(0, Math.min(failed, room));
}

/** Where a claimed Letter goes after its send (SPEC §7 step 7). A delivery clears the last error. */
export function afterSend(result: SendResult, attempts: number): DeliveryUpdate {
  if (result.ok) return { status: "DELIVERED", resendEmailId: result.emailId, lastError: null };
  // Over quota isn't the Letter's fault: it waits for the next run with no attempt counted.
  if (result.isQuota) return { status: "SCHEDULED", attempts };
  return failedAttempt(attempts, result.error);
}

/**
 * The Bounce a Resend webhook event reports (SPEC §7 Bounce webhook), or null for events that
 * don't concern delivery. Error names only: bounce messages can echo the recipient address.
 */
export function bounceOf(event: WebhookEventPayload): Bounce | null {
  switch (event.type) {
    case "email.bounced": {
      const { type, subType } = event.data.bounce;
      return { emailId: event.data.email_id, isHard: type === "Permanent", error: `bounced:${type}:${subType}` };
    }
    case "email.suppressed":
    case "email.complained":
      return { emailId: event.data.email_id, isHard: true, error: event.type.slice("email.".length) };
    case "email.failed":
      return { emailId: event.data.email_id, isHard: false, error: "failed" };
    default:
      return null;
  }
}

/** Where a Delivered Letter goes after a Bounce: Undeliverable at once if hard, else a retry. */
export function afterBounce(bounce: Bounce, attempts: number): DeliveryUpdate {
  if (bounce.isHard) return { status: "UNDELIVERABLE", attempts, lastError: bounce.error };
  return failedAttempt(attempts, bounce.error);
}

/** The time the failure report judges due-ness at: the day's last run, so a Letter due later isn't reported. */
export function lastRunTime(now: Date): Date {
  const lastRun = new Date(now);
  lastRun.setUTCHours(LAST_RUN_HOUR_UTC, 0, 0, 0);
  return lastRun < now ? lastRun : now;
}

/**
 * The day's failure report for the ops inbox (SPEC §7 Failure report), or null when every due
 * Letter went out, so a normal day costs no email.
 */
export function failureReport(letters: UndeliveredLetter[], day: string): OpsEmail | null {
  if (letters.length === 0) return null;
  const count = letters.length === 1 ? "1 Letter" : `${letters.length} Letters`;
  return {
    subject: `Kesho delivery ${day}: ${count} not delivered`,
    text: [
      `${count} not delivered after today's runs.`,
      `UNDELIVERABLE: failed ${MAX_ATTEMPTS} times, or hard-bounced. SCHEDULED: due but unsent (failing, over quota or no run). SENDING: a run died mid-send, or is still running.`,
      "",
      ...letters.map((letter) => `${letter.id}  ${letter.status}  attempts ${letter.attempts}  ${letter.lastError ?? "no error"}`),
    ].join("\n"),
  };
}

// Every failure counts an attempt; the last one makes the Letter Undeliverable.
function failedAttempt(attempts: number, error: string): DeliveryUpdate {
  const failed = attempts + 1;
  return { status: failed >= MAX_ATTEMPTS ? "UNDELIVERABLE" : "SCHEDULED", attempts: failed, lastError: error };
}
