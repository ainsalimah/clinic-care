import assert from "node:assert/strict";
import test from "node:test";
import { canAccessApi, canAccessPath } from "./access";

test("page and API policies are evaluated independently", () => {
  assert.equal(canAccessPath("/admin/reports", "DOCTOR"), false);
  assert.equal(canAccessApi("/admin/reports", "GET", "DOCTOR"), true);
  assert.equal(canAccessApi("/medicines", "GET", "DOCTOR"), true);
});

test("unknown protected API is denied by default", () => {
  assert.equal(canAccessApi("/unknown", "GET", "ADMIN"), false);
});

test("method and role restrictions are enforced", () => {
  assert.equal(canAccessApi("/bills/123/pay", "POST", "PHARMACIST"), true);
  for (const role of ["ADMIN", "PATIENT", "DOCTOR", "RECEPTIONIST"]) {
    assert.equal(canAccessApi("/bills/123/pay", "POST", role), false);
  }
  assert.equal(canAccessApi("/doctor-fees", "PATCH", "ADMIN"), true);
  assert.equal(canAccessApi("/doctor-fees", "PATCH", "PHARMACIST"), false);
  assert.equal(canAccessApi("/patients", "POST", "RECEPTIONIST"), true);
  assert.equal(canAccessApi("/patients", "POST", "ADMIN"), false);
  assert.equal(canAccessApi("/records", "GET", "PHARMACIST"), false);
});
