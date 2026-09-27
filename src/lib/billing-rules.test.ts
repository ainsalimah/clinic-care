import test from "node:test";
import assert from "node:assert/strict";
import { billLines, paymentInput } from "./billing-rules";

test("consultation and medicine use quantity times saved unit price", () => {
  const source = { name: "Amoksisilin", unit: "tablet", price: 9500, quantity: 2 };
  const bill = billLines("dr. Anisa", 100000, [source]);
  source.price = 20000;
  assert.equal(bill.total, 119000);
  assert.equal(bill.items[1].amount, 19000);
  assert.equal(bill.items[1].unitPrice, 9500);
});
test("visit without prescription still has consultation bill", () => {
  assert.equal(billLines("dr. Anisa", 100000, []).total, 100000);
});
test("invalid money, quantity and total overflow are rejected", () => {
  for (const price of [-1, 0.5, NaN, Infinity, 2000000001]) {
    assert.throws(() => billLines("Dokter", price, []));
  }
  assert.throws(() => billLines("Dokter", 100000, [{ name: "Obat", unit: "tablet", price: 2000000000, quantity: 2 }]));
  assert.throws(() => billLines("Dokter", 100000, [{ name: "Obat", unit: "tablet", price: 10, quantity: 0 }]));
});
test("cash allows change; QRIS requires exact amount; underpayment fails", () => {
  assert.equal(paymentInput("CASH", 150000, 119000).amount - 119000, 31000);
  assert.deepEqual(paymentInput("QRIS", 119000, 119000), { method: "QRIS", amount: 119000 });
  assert.throws(() => paymentInput("CASH", 100000, 119000));
  assert.throws(() => paymentInput("QRIS", 150000, 119000));
  assert.throws(() => paymentInput("CARD", 119000, 119000));
});
