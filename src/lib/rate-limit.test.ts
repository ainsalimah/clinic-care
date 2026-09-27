import assert from "node:assert/strict";
import test from "node:test";
import { rateLimitKey, retryAfterSeconds } from "./rate-limit";

test("rate limit keys normalize identities without storing raw identifiers", () => {
  assert.equal(rateLimitKey("login", " User@Example.com "), rateLimitKey("login", "user@example.com"));
  assert.notEqual(rateLimitKey("login", "user@example.com"), rateLimitKey("register", "user@example.com"));
  assert.equal(rateLimitKey("login", "user@example.com").length, 64);
});

test("retry-after is rounded up and never below one second", () => {
  const now = new Date("2026-09-27T00:00:00.000Z");
  assert.equal(retryAfterSeconds(new Date("2026-09-27T00:00:01.001Z"), now), 2);
  assert.equal(retryAfterSeconds(new Date("2026-09-26T23:59:00.000Z"), now), 1);
});
