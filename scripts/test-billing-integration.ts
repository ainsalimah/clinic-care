import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { PrismaClient, Prisma } from "@prisma/client";
import { createBill } from "../src/features/billing/server/create-bill";
import { payBill } from "../src/features/billing/server/pay-bill";
import { updatePrescription } from "../src/features/pharmacy/server/update-prescription";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const rollback = new Error("ROLLBACK_BILLING_TEST");

async function main() {
  try {
    await db.$transaction(async tx => {
      const suffix = randomUUID();
      const department = await tx.department.create({ data: { name: "Billing test " + suffix } });
      const user = await tx.user.create({ data: { name: "Billing Test Doctor", email: suffix + "@example.invalid", passwordHash: "not-a-login", role: "DOCTOR", isActive: false } });
      const doctor = await tx.doctor.create({ data: { userId: user.id, departmentId: department.id, fullName: "dr. Test", consultationFee: 100000 } });
      const patient = await tx.patient.create({ data: { fullName: "Billing Test Patient", medicalRecordNo: suffix, dateOfBirth: new Date("1990-01-01") } });
      const medicine = await tx.medicine.create({ data: { name: "Test medicine", unit: "tablet", price: 9500, stock: 3 } });
      async function visit(withPrescription: boolean) {
        const appointment = await tx.appointment.create({ data: {
          patientId: patient.id, doctorId: doctor.id, departmentId: department.id,
          appointmentDate: new Date(), status: "COMPLETED",
        } });
        const record = await tx.medicalRecord.create({ data: { appointmentId: appointment.id, patientId: patient.id, doctorId: doctor.id } });
        const prescription = withPrescription ? await tx.prescription.create({ data: {
          medicalRecordId: record.id, patientId: patient.id, doctorId: doctor.id,
          items: { create: { medicineId: medicine.id, quantity: 2, dosage: "TEST", instruction: "TEST" } },
        } }) : null;
        return { bill: await createBill(tx, appointment.id), prescription };
      }
      const first = await visit(true);
      assert.equal(first.bill.total, 119000);
      await assert.rejects(() => payBill(tx, first.bill.id, "CASH", 150000, "Test cashier"), /Siapkan obat/);
      const rxId = first.prescription!.id;
      await updatePrescription(tx, rxId, "PROCESSING");
      await updatePrescription(tx, rxId, "READY");
      await assert.rejects(() => updatePrescription(tx, rxId, "COMPLETED"), /Lunasi/);
      await assert.rejects(() => payBill(tx, first.bill.id, "CASH", 1000, "Test cashier"), /kurang/);
      await tx.medicine.update({ where: { id: medicine.id }, data: { price: 20000 } });
      await tx.doctor.update({ where: { id: doctor.id }, data: { consultationFee: 120000 } });
      assert.equal((await tx.bill.findUniqueOrThrow({ where: { id: first.bill.id } })).total, 119000);
      await payBill(tx, first.bill.id, "CASH", 150000, "Test cashier");
      await assert.rejects(() => payBill(tx, first.bill.id, "CASH", 150000, "Another cashier"), /sudah lunas/);
      assert.equal((await tx.medicine.findUniqueOrThrow({ where: { id: medicine.id } })).reservedStock, 2);
      assert.equal((await tx.medicine.findUniqueOrThrow({ where: { id: medicine.id } })).stock, 3);
      const second = await visit(true);
      await updatePrescription(tx, second.prescription!.id, "PROCESSING");
      await updatePrescription(tx, second.prescription!.id, "READY");
      await assert.rejects(() => payBill(tx, second.bill.id, "CASH", second.bill.total, "Test cashier"), /Stok tersedia/);
      await updatePrescription(tx, rxId, "COMPLETED");
      await updatePrescription(tx, rxId, "COMPLETED");
      const remaining = await tx.medicine.findUniqueOrThrow({ where: { id: medicine.id } });
      assert.equal(remaining.stock, 1);
      assert.equal(remaining.reservedStock, 0);
      assert.equal(await tx.inventoryTransaction.count({ where: { referenceId: rxId } }), 1);
      assert.ok((await tx.bill.findUniqueOrThrow({ where: { id: first.bill.id } })).completedAt);
      const noRx = await visit(false);
      assert.equal(noRx.bill.total, 120000);
      await payBill(tx, noRx.bill.id, "QRIS", noRx.bill.total, "Test cashier");
      assert.ok((await tx.bill.findUniqueOrThrow({ where: { id: noRx.bill.id } })).completedAt);
      throw rollback;
    }, { timeout: 60000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error !== rollback) throw error;
    console.log("PASS: snapshots, consultation-only, payment validation, duplicate payment, stock reservation, dispensing once. Test data rolled back.");
  } finally { await db.$disconnect(); }
}
main().catch((error) => { console.error("Billing integration test failed:", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; });
