import assert from "node:assert/strict";
import { test } from "node:test";
import { sealedLabel } from "./sealed-label.ts";

const now = new Date("2026-09-24T22:30:00Z");

test("a Scheduled Letter counts down from the Author's local today", () => {
  const letter = { status: "SCHEDULED", deliveryDate: "2026-09-26" } as const;
  assert.equal(sealedLabel({ ...letter, timeZone: "America/Los_Angeles" }, now), "Opens 26 Sept 2026 · 2 days");
  assert.equal(sealedLabel({ ...letter, timeZone: "Africa/Addis_Ababa" }, now), "Opens 26 Sept 2026 · 1 day");
});

test("a Pending Letter asks the Author to verify instead of counting down", () => {
  const letter = { status: "PENDING", deliveryDate: "2027-09-24", timeZone: "UTC" } as const;
  assert.equal(sealedLabel(letter, now), "Pending · verify your email");
});

test("a Scheduled Letter whose date has come stops counting down", () => {
  const letter = { status: "SCHEDULED", timeZone: "UTC" } as const;
  assert.equal(sealedLabel({ ...letter, deliveryDate: "2026-09-24" }, now), "Opens today");
  assert.equal(sealedLabel({ ...letter, deliveryDate: "2026-09-21" }, now), "On its way");
});
