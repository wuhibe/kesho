import assert from "node:assert/strict";
import { test } from "node:test";
import { initialStatus, sealOutcome } from "./seal-rules.ts";

const author = { id: "author-a", emailVerified: true };

test("a new Letter is inserted while the Author holds fewer than 20", () => {
  assert.equal(sealOutcome(author, null, 19), "insert");
  assert.equal(sealOutcome(author, null, 20), "capped");
});

test("re-sending an already sealed draft succeeds even at the cap", () => {
  assert.equal(sealOutcome(author, "author-a", 20), "already-sealed");
});

test("a draft id already held by another Author is refused", () => {
  assert.equal(sealOutcome(author, "author-b", 0), "id-taken");
});

test("a Letter waits PENDING until its Author verifies their email", () => {
  assert.equal(initialStatus({ id: "x", emailVerified: false }), "PENDING");
  assert.equal(initialStatus(author), "SCHEDULED");
});
