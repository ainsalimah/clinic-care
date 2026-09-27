import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionPrescription, parsePrescriptionItems } from "./prescription-rules";

test("prescription workflow only moves forward", () => {
  assert.equal(canTransitionPrescription("PENDING", "PROCESSING"), true);
  assert.equal(canTransitionPrescription("PROCESSING", "READY"), true);
  assert.equal(canTransitionPrescription("READY", "COMPLETED"), true);
  assert.equal(canTransitionPrescription("COMPLETED", "READY"), false);
  assert.equal(canTransitionPrescription("CANCELLED", "PENDING"), false);
});

test("prescription items require unique medicines and positive integer quantities", () => {
  assert.deepEqual(parsePrescriptionItems([{ medicineId: "m1", dosage: "1 tablet", quantity: 2, instruction: "Sesudah makan" }]),
    [{ medicineId: "m1", dosage: "1 tablet", quantity: 2, instruction: "Sesudah makan" }]);
  assert.throws(() => parsePrescriptionItems([{ medicineId: "m1", dosage: "x", quantity: -1, instruction: "x" }]));
  assert.throws(() => parsePrescriptionItems([
    { medicineId: "m1", dosage: "x", quantity: 1, instruction: "x" },
    { medicineId: "m1", dosage: "y", quantity: 1, instruction: "y" },
  ]));
});
