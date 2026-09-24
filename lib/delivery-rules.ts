import type { WebhookEventPayload } from "resend";
import { isCalendarDate } from "./delivery-date.ts";
import type { SendResult } from "./email.ts";

// Pure rules for the daily delivery run (SPEC §7), kept apart from the DB so they can be tested.

/** Resend Free's daily limit, shared by every email Kesho sends (SPEC §2). */
const DAILY_EMAIL_LIMIT = 100;
/** Leaves room under the daily limit for the day's account emails. */
const RUN_CAP = 90;
const MAX_ATTEMPTS = 3;

/** A claimed Letter's next state once its send is done. */
export type DeliveryUpdate =
  | { status: "DELIVERED"; resendEmailId: string }
  | { status: "SCHEDULED" | "UNDELIVERABLE"; attempts: number; lastError?: string };

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

/** Where a claimed Letter goes after its send (SPEC §7 step 7). */
export function afterSend(result: SendResult, attempts: number): DeliveryUpdate {
  if (result.ok) return { status: "DELIVERED", resendEmailId: result.emailId };
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

// Every failure counts an attempt; the third makes the Letter Undeliverable.
function failedAttempt(attempts: number, error: string): DeliveryUpdate {
  const failed = attempts + 1;
  return { status: failed >= MAX_ATTEMPTS ? "UNDELIVERABLE" : "SCHEDULED", attempts: failed, lastError: error };
}
