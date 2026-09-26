import { setTimeout as sleep } from "node:timers/promises";
import { deliveryEmail } from "@/emails/delivery";
import { db } from "@/lib/db";
import { fromUtcDate } from "@/lib/delivery-date";
import { afterSend, idempotencyKey, RETRY_DELAY_MS, retryBudget, runBudget } from "@/lib/delivery-rules";
import { type SendResult, sendDeliveryEmail } from "@/lib/email";
import { decrypt } from "@/lib/encryption";
import {
  type ClaimedLetter,
  claimLetters,
  type ClaimScope,
  countSendsToday,
  decryptSubject,
  recordSend,
  releaseStaleClaims,
} from "@/lib/letters";

const UNVERIFIED_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// ponytail: sequential sends paced under Resend's default 2 requests/s; ~45 s for a full budget of 90.
const SEND_GAP_MS = 500;
const RATE_LIMIT_BACKOFF_MS = 1000;

export type RunSummary = { released: number; purged: number; passes: PassSummary[] };

/**
 * One claim-and-send pass. `deferred` went back to SCHEDULED over quota with no attempt counted;
 * `failed` went back after a failed send that cost one.
 */
export type PassSummary = {
  budget: number;
  claimed: number;
  delivered: number;
  deferred: number;
  failed: number;
  undeliverable: number;
};

/**
 * The delivery run, steps 2–8 of SPEC §7. Scope "all" ignores the Delivery date, for the
 * shutdown promise (SPEC §9). Returns counts only: no ids, emails or content.
 */
export async function runDelivery(now: Date, scope: ClaimScope = "due"): Promise<RunSummary> {
  const startedAt = Date.now();
  const released = await releaseStaleClaims(now);
  const purged = await purgeUnverifiedAuthors(now);
  const passes = [await sendPass(now, scope, Infinity)];
  // A failed Letter is claimed again under its next attempt, so its retry gets a fresh idempotency key.
  const retries = retryBudget(passes[0].failed, Date.now() - startedAt);
  if (retries > 0) {
    await sleep(RETRY_DELAY_MS);
    passes.push(await sendPass(now, scope, retries));
  }
  return { released, purged, passes };
}

async function sendPass(now: Date, scope: ClaimScope, limit: number): Promise<PassSummary> {
  const budget = Math.min(limit, runBudget(await countSendsToday(now)));
  const letters = await claimLetters(now, budget, scope);

  const summary: PassSummary = { budget, claimed: letters.length, delivered: 0, deferred: 0, failed: 0, undeliverable: 0 };
  // Once Resend reports the day's or month's quota spent, the rest wait for the next run unsent.
  let overQuota: SendResult | null = null;
  for (const [i, letter] of letters.entries()) {
    if (i > 0 && !overQuota) await sleep(SEND_GAP_MS);
    const result: SendResult = overQuota ?? (await sendPaced(letter));
    if (!result.ok && result.isQuota && result.error !== "rate_limit_exceeded") overQuota = result;
    const update = afterSend(result, letter.attempts);
    await recordSend(letter.id, update, now);
    if (update.status === "DELIVERED") summary.delivered++;
    else if (update.status === "UNDELIVERABLE") summary.undeliverable++;
    else if (update.lastError) summary.failed++;
    else summary.deferred++;
    console.info(`letter ${letter.id}: ${update.status}`);
  }
  return summary;
}

// Accounts never verified within 7 days go, and their PENDING Letters cascade (SPEC §7 step 3).
async function purgeUnverifiedAuthors(now: Date): Promise<number> {
  const { count } = await db.user.deleteMany({
    where: { emailVerified: false, createdAt: { lt: new Date(now.getTime() - UNVERIFIED_TTL_MS) } },
  });
  return count;
}

// A per-second rate limit (an account email sent at the same moment) is worth one retry with the
// same key; if it persists, it goes back as over quota rather than costing the Letter an attempt.
async function sendPaced(letter: ClaimedLetter): Promise<SendResult> {
  const result = await send(letter);
  if (result.ok || result.error !== "rate_limit_exceeded") return result;
  await sleep(RATE_LIMIT_BACKOFF_MS);
  return send(letter);
}

// One Letter's failure, even a thrown one, must not stop the run or strand the Letter as SENDING.
async function send(letter: ClaimedLetter): Promise<SendResult> {
  try {
    const email = deliveryEmail({
      subject: decryptSubject(letter.subject),
      body: decrypt(letter.body),
      deliveryDate: fromUtcDate(letter.deliveryDate),
      timeZone: letter.timeZone,
      createdAt: letter.createdAt,
    });
    const key = idempotencyKey(process.env.VERCEL_ENV, letter.id, letter.attempts);
    return await sendDeliveryEmail(letter.email, email, key);
  } catch (error) {
    return { ok: false, isQuota: false, error: error instanceof Error ? error.message.slice(0, 200) : "unknown" };
  }
}
