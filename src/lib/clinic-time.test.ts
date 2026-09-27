import assert from "node:assert/strict";
import test from "node:test";
import { getClinicDateKey, getClinicDayRange } from "./clinic-time";

test("clinic date follows WIB across the UTC day boundary", () => {
  assert.equal(getClinicDateKey(new Date("2026-09-23T16:59:59.000Z")), "2026-09-23");
  assert.equal(getClinicDateKey(new Date("2026-09-23T17:00:00.000Z")), "2026-09-24");
});

test("clinic day range spans exactly one WIB calendar day", () => {
  const { start, end } = getClinicDayRange(new Date("2026-09-24T12:00:00.000Z"));
  assert.equal(start.toISOString(), "2026-09-23T17:00:00.000Z");
  assert.equal(end.toISOString(), "2026-09-24T17:00:00.000Z");
});
