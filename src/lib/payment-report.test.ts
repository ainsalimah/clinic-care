import test from "node:test";
import assert from "node:assert/strict";
import { reportRange } from "./payment-report";
test("report dates include full WIB day with exclusive end", () => {
  const range = reportRange("2026-09-27", "2026-09-27");
  assert.equal(range.start.toISOString(), "2026-09-26T17:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-09-27T17:00:00.000Z");
});
test("report rejects malformed, reversed and excessive date ranges", () => {
  for (const [from, to] of [[null, null], ["2026-02-30", "2026-03-01"], ["2026-09-27", "2026-09-26"], ["2026-01-01", "2026-03-01"]]) {
    assert.throws(() => reportRange(from, to));
  }
});
