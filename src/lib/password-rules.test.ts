import test from "node:test";
import assert from "node:assert/strict";
import { validatePassword } from "./password-rules";
test("password baru minimal 12 karakter dan maksimal 72 byte", () => {
  assert.throws(() => validatePassword("pendek"));
  assert.equal(validatePassword("kata-sandi-aman-2026"), "kata-sandi-aman-2026");
  assert.throws(() => validatePassword("é".repeat(40)));
});
