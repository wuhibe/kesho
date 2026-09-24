import assert from "node:assert/strict";
import { test } from "node:test";
import { routeEmail } from "./email-redirect.ts";

const author = "author@example.com";
const inbox = "owner@example.com";

test("production mail goes to the Author unchanged", () => {
  const routed = routeEmail(author, "Reset your Kesho password", { VERCEL_ENV: "production", EMAIL_REDIRECT_TO: inbox });
  assert.deepEqual(routed, { to: author, subject: "Reset your Kesho password" });
});

test("preview mail is redirected with a [preview] prefix", () => {
  const routed = routeEmail(author, "Reset your Kesho password", { VERCEL_ENV: "preview", EMAIL_REDIRECT_TO: inbox });
  assert.deepEqual(routed, { to: inbox, subject: "[preview] Reset your Kesho password" });
});

test("local mail is redirected with a [local] prefix", () => {
  const routed = routeEmail(author, "Reset your Kesho password", { EMAIL_REDIRECT_TO: inbox });
  assert.deepEqual(routed, { to: inbox, subject: "[local] Reset your Kesho password" });
});

test("non-production mail without a redirect target is refused rather than sent to the Author", () => {
  assert.throws(() => routeEmail(author, "Reset your Kesho password", { VERCEL_ENV: "preview" }), /EMAIL_REDIRECT_TO/);
});
