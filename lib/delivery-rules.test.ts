import assert from "node:assert/strict";
import { test } from "node:test";
import { afterBounce, afterSend, bounceOf, runBudget, runTime } from "./delivery-rules.ts";

const clock = new Date("2027-09-24T06:12:00Z");

test("a ?now= override moves the run to that day's 06:00 UTC outside production", () => {
  assert.deepEqual(runTime("2030-01-01", { VERCEL_ENV: "preview" }, clock), new Date("2030-01-01T06:00:00Z"));
  assert.deepEqual(runTime(null, {}, clock), clock);
  assert.equal(runTime("tomorrow", {}, clock), null);
});

test("production ignores a ?now= override", () => {
  assert.deepEqual(runTime("2030-01-01", { VERCEL_ENV: "production" }, clock), clock);
});

test("the budget is 90, less whatever pushes the day past 100 emails", () => {
  assert.equal(runBudget(0), 90);
  assert.equal(runBudget(25), 75);
  assert.equal(runBudget(120), 0);
});

test("a sent Letter is Delivered", () => {
  assert.deepEqual(afterSend({ ok: true, emailId: "em_1" }, 1), { status: "DELIVERED", resendEmailId: "em_1" });
});

test("a Letter over quota goes back to Scheduled without counting an attempt", () => {
  assert.deepEqual(afterSend({ ok: false, isQuota: true, error: "daily_quota_exceeded" }, 1), {
    status: "SCHEDULED",
    attempts: 1,
  });
});

test("a failed send is retried twice, then the Letter is Undeliverable", () => {
  const failure = { ok: false, isQuota: false, error: "application_error" } as const;
  assert.equal(afterSend(failure, 0).status, "SCHEDULED");
  assert.equal(afterSend(failure, 1).status, "SCHEDULED");
  assert.deepEqual(afterSend(failure, 2), { status: "UNDELIVERABLE", attempts: 3, lastError: "application_error" });
});

type ResendEvent = Parameters<typeof bounceOf>[0];
// Cast: these carry only the fields bounceOf reads.
const event = (type: string, data: object = {}) => ({ type, data: { email_id: "em_1", ...data } }) as ResendEvent;
const bounced = (type: string) => event("email.bounced", { bounce: { type, subType: "General", message: "550" } });

test("a permanent bounce, a suppression or a complaint makes a Delivered Letter Undeliverable at once", () => {
  for (const hard of [bounced("Permanent"), event("email.suppressed"), event("email.complained")]) {
    assert.equal(afterBounce(bounceOf(hard)!, 0).status, "UNDELIVERABLE");
  }
});

test("a transient or undetermined bounce or a failed email is retried, then Undeliverable on the third", () => {
  for (const soft of [bounced("Transient"), bounced("Undetermined"), event("email.failed")]) {
    const bounce = bounceOf(soft)!;
    assert.deepEqual(afterBounce(bounce, 0), { status: "SCHEDULED", attempts: 1, lastError: bounce.error });
    assert.equal(afterBounce(bounce, 2).status, "UNDELIVERABLE");
  }
});

test("a Bounce names the email it's about", () => {
  assert.equal(bounceOf(event("email.complained"))?.emailId, "em_1");
});

test("events that don't concern delivery are ignored", () => {
  assert.equal(bounceOf(event("email.delivered")), null);
});
