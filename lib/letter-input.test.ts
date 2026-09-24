import assert from "node:assert/strict";
import { test } from "node:test";
import { parseLetterInput } from "./letter-input.ts";

// 22:30 UTC on 24 Sept is already 25 Sept in Addis Ababa.
const now = new Date("2026-09-24T22:30:00Z");
const letter = {
  id: "0b6f3c1e-8f2a-4c1d-9e7b-2a5d4f6e8c90",
  subject: "  On turning 30 ",
  body: "Did you keep the promise?",
  deliveryDate: "2027-09-25",
  timeZone: "Africa/Addis_Ababa",
};

test("a valid letter is accepted with its subject trimmed", () => {
  assert.deepEqual(parseLetterInput(letter, now), { ...letter, subject: "On turning 30" });
});

test("the Delivery date must be at least tomorrow in the Author's timezone", () => {
  assert.equal(parseLetterInput({ ...letter, deliveryDate: "2026-09-25" }, now), null);
  assert.ok(parseLetterInput({ ...letter, deliveryDate: "2026-09-25", timeZone: "America/Los_Angeles" }, now));
});

test("the Delivery date can be at most five years out", () => {
  assert.ok(parseLetterInput({ ...letter, deliveryDate: "2031-09-25" }, now));
  assert.equal(parseLetterInput({ ...letter, deliveryDate: "2031-09-26" }, now), null);
});

test("a blank body, unknown timezone or oversized subject is rejected", () => {
  assert.equal(parseLetterInput({ ...letter, body: " \n " }, now), null);
  assert.equal(parseLetterInput({ ...letter, timeZone: "Mars/Olympus" }, now), null);
  assert.equal(parseLetterInput({ ...letter, subject: "x".repeat(151) }, now), null);
});
