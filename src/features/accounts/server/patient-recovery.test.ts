import test from "node:test";
import assert from "node:assert/strict";
import { createTemporaryPassword, maskEmail } from "./patient-recovery";

test("email petunjuk menyembunyikan sebagian nama akun", () => {
  assert.equal(maskEmail("nurainsalimah@gmail.com"), "nur**********@gmail.com");
  assert.equal(maskEmail("a@example.com"), "a***@example.com");
});

test("password sementara kuat, unik, dan memenuhi aturan panjang", () => {
  const first = createTemporaryPassword();
  const second = createTemporaryPassword();
  assert.notEqual(first, second);
  assert.match(first, /^Kc!9a-[A-Za-z0-9_-]{22}$/);
  assert.ok(Buffer.byteLength(first) <= 72);
});
