import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSend, runBudget, runTime } from "./delivery-rules.ts";

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
