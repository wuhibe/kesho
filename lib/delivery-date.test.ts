import assert from "node:assert/strict";
import { test } from "node:test";
import { addMonths, chosenDeliveryDate, deliveryDateRange, isCalendarDate, isDue, todayIn } from "./delivery-date.ts";

test("today is the Author's local date, not UTC's", () => {
  const now = new Date("2026-09-24T22:30:00Z");
  assert.equal(todayIn("Africa/Addis_Ababa", now), "2026-09-25");
  assert.equal(todayIn("America/Los_Angeles", now), "2026-09-24");
});

test("adding months clamps to the end of a shorter month", () => {
  assert.equal(addMonths("2026-08-31", 6), "2027-02-28");
  assert.equal(addMonths("2028-02-29", 60), "2033-02-28");
});

test("a Delivery date runs from tomorrow to five years out", () => {
  assert.deepEqual(deliveryDateRange("2026-12-31"), { min: "2027-01-01", max: "2031-12-31" });
});

test("only real calendar days count as dates", () => {
  assert.equal(isCalendarDate("2027-02-28"), true);
  assert.equal(isCalendarDate("2027-02-30"), false);
  assert.equal(isCalendarDate("27-2-28"), false);
});

test("a picked date outside tomorrow…five years resolves to no Delivery date", () => {
  assert.equal(chosenDeliveryDate("2026-09-24", { months: 12 }), "2027-09-24");
  assert.equal(chosenDeliveryDate("2026-09-24", { date: "2026-10-01" }), "2026-10-01");
  assert.equal(chosenDeliveryDate("2026-09-24", { date: "2026-09-24" }), null);
  assert.equal(chosenDeliveryDate("2026-09-24", { date: "" }), null);
});

test("a Letter is due once its date has come in the Author's timezone, west or east of UTC", () => {
  // The daily run fires at 06:00 UTC: 09:00 in Addis Ababa, 23:00 the day before in Los Angeles.
  const run = new Date("2027-09-24T06:00:00Z");
  assert.equal(isDue({ deliveryDate: "2027-09-24", timeZone: "Africa/Addis_Ababa" }, run), true);
  assert.equal(isDue({ deliveryDate: "2027-09-24", timeZone: "America/Los_Angeles" }, run), false);
  assert.equal(isDue({ deliveryDate: "2027-09-23", timeZone: "America/Los_Angeles" }, run), true);
});
