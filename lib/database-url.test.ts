import assert from "node:assert/strict";
import { test } from "node:test";
import { withVerifiedTls } from "./database-url.ts";

const neonUrl = "postgresql://owner:p%40ss%2Fw0rd@ep-x-pooler.neon.tech/neondb?sslmode=require&channel_binding=require";

test("a Neon URL keeps its certificate check, password and other options", () => {
  const url = new URL(withVerifiedTls(neonUrl));
  assert.equal(url.searchParams.get("sslmode"), "verify-full");
  assert.equal(url.password, "p%40ss%2Fw0rd");
  assert.equal(url.searchParams.get("channel_binding"), "require");
});

test("a URL that turns TLS off is left alone", () => {
  const local = "postgresql://postgres@localhost:5432/kesho?sslmode=disable";
  assert.equal(withVerifiedTls(local), local);
});

test("a malformed URL fails without echoing its password", () => {
  assert.throws(
    () => withVerifiedTls("postgresql://owner:se#cret@host/db"),
    (error: Error) => !JSON.stringify({ ...error, message: error.message }).includes("se#cret"),
  );
});
