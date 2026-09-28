import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getClinicDateKey } from "../src/lib/clinic-time";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const base = process.env.E2E_BASE_URL || "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("E2E runs only against a local server.");
const runId = randomUUID();
const patientName = "E2E VISIT " + runId;
const users: string[] = [];
let departmentId: string | undefined;
let doctorId: string | undefined;
let medicineId: string | undefined;
const cookies: Partial<Record<Role, string>> = {};
let testPassword = "";

async function api<T = Record<string, unknown>>(role: Role, path: string, method = "GET", body?: unknown, status = 200): Promise<T> {
  const response = await fetch(base + path, {
    method, headers: { "Content-Type": "application/json", Cookie: cookies[role] ?? "", Origin: base },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, status, method + " " + path);
  return response.json() as Promise<T>;
}
async function setup() {
  testPassword = randomUUID() + "!9Aa";
  const hash = await bcrypt.hash(testPassword, 10);
  for (const role of ["ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"] as Role[]) {
    const user = await db.user.create({ data: { name: "E2E " + role, role, email: runId + "." + role.toLowerCase() + "@example.invalid", passwordHash: hash } });
    users.push(user.id);
    if (role === "DOCTOR") {
      const department = await db.department.create({ data: { name: "E2E " + runId } }); departmentId = department.id;
      const doctor = await db.doctor.create({ data: { userId: user.id, departmentId, fullName: "dr. E2E", consultationFee: 100000 } }); doctorId = doctor.id;
    }
    const response = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, password: testPassword }) });
    assert.equal(response.status, 200, "Test role login");
    cookies[role] = response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  }
  const medicine = await db.medicine.create({ data: { name: "E2E medicine " + runId, price: 9500, stock: 10, unit: "tablet" } }); medicineId = medicine.id;
}

async function visit(withRx: boolean) {
  const patient = await db.patient.findFirstOrThrow({ where: { fullName: patientName } });
  const result = await api<{ queue: { id: string; appointmentId: string } }>("RECEPTIONIST", "/api/queues/check-in", "POST", { patientId: patient.id, doctorId, departmentId }, 201);
  const queueId = result.queue.id;
  await api("DOCTOR", "/api/queues", "PATCH", { queueId, status: "CALLED" });
  await api("DOCTOR", "/api/queues", "PATCH", { queueId, status: "IN_ROOM" });
  const exam = await api<{ prescription: { id: string } | null }>("DOCTOR", "/api/doctor/examination", "POST", {
    appointmentId: result.queue.appointmentId, diagnosis: "SYNTHETIC E2E", complaint: "TEST ONLY",
    prescriptionItems: withRx ? [{ medicineId, quantity: 2, dosage: "TEST", instruction: "TEST" }] : [],
  }, 201);
  const bill = await db.bill.findUniqueOrThrow({ where: { appointmentId: result.queue.appointmentId }, include: { items: true } });
  assert.equal(bill.total, withRx ? 119000 : 100000);
  return { bill, rxId: exam.prescription?.id };
}

async function run() {
  await setup();
  await api("RECEPTIONIST", "/api/patients", "POST", { fullName: patientName, dateOfBirth: "1990-01-01", gender: "UNKNOWN" }, 201);
  const recoveryPatient = await db.patient.findFirstOrThrow({ where: { fullName: patientName } });
  const patientEmail = runId + ".patient@example.invalid";
  const patientUser = await db.user.create({ data: { name: patientName, email: patientEmail, role: "PATIENT", passwordHash: await bcrypt.hash(testPassword, 10) } });
  users.push(patientUser.id);
  const recoveryNik = (Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0")).slice(0, 16);
  const recoveryPhone = "081234567890";
  await db.patient.update({ where: { id: recoveryPatient.id }, data: { userId: patientUser.id, nik: recoveryNik, phone: recoveryPhone } });
  const patientLogin = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: patientEmail, password: testPassword }) });
  assert.equal(patientLogin.status, 200);
  const patientCookie = patientLogin.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  const recoveryIdentity = { patientId: recoveryPatient.id, nik: recoveryNik, dateOfBirth: "1990-01-01", phone: recoveryPhone, adminPassword: testPassword };
  await api("ADMIN", "/api/admin/patient-accounts", "POST", { ...recoveryIdentity, action: "identify", nik: "0000000000000000" }, 409);
  const identified = await api<{ email: string }>("ADMIN", "/api/admin/patient-accounts", "POST", { ...recoveryIdentity, action: "identify" });
  assert.equal(identified.email, patientEmail);
  const recovered = await api<{ temporaryPassword: string }>("ADMIN", "/api/admin/patient-accounts", "POST", { ...recoveryIdentity, action: "reset" });
  assert.ok(recovered.temporaryPassword);
  assert.equal((await fetch(base + "/api/patient/appointments", { headers: { Cookie: patientCookie } })).status, 401, "Recovery revokes old sessions");
  assert.equal((await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: patientEmail, password: testPassword }) })).status, 401, "Old password is rejected");
  const temporaryLogin = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: patientEmail, password: recovered.temporaryPassword }) });
  assert.equal(temporaryLogin.status, 200);
  const temporaryCookie = temporaryLogin.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert.equal((await fetch(base + "/api/patient/appointments", { headers: { Cookie: temporaryCookie } })).status, 403, "Temporary password requires replacement");
  const patientFinalPassword = randomUUID() + "!9Aa";
  assert.equal((await fetch(base + "/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json", Cookie: temporaryCookie, Origin: base }, body: JSON.stringify({ currentPassword: recovered.temporaryPassword, password: patientFinalPassword }) })).status, 200);
  const { bill, rxId } = await visit(true);
  assert.ok(rxId);
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "PROCESSING" });
  await db.medicine.update({ where: { id: medicineId }, data: { stock: 1 } });
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "READY" }, 409);
  await api("PHARMACIST", "/api/stock-holds", "POST", { id: rxId, hold: true, reason: "E2E menunggu stok tambahan" });
  await api("PHARMACIST", "/api/bills/" + bill.id + "/pay", "POST", { method: "CASH", receivedAmount: 150000, confirmed: true, expectedTotal: 119000 }, 409);
  await api("PHARMACIST", "/api/stock-holds", "POST", { id: rxId, hold: false }, 409);
  await db.medicine.update({ where: { id: medicineId }, data: { stock: 10 } });
  await api("PHARMACIST", "/api/stock-holds", "POST", { id: rxId, hold: false });
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "READY" });
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "COMPLETED" }, 409);
  const request = await api<{ result: { id: string } }>("PHARMACIST", "/api/bill-adjustments", "POST", { action: "request", id: bill.id, kind: "CORRECTION", amount: -9000, reason: "E2E koreksi tarif" });
  const payment = { method: "CASH", receivedAmount: 150000, confirmed: true, expectedTotal: 119000 };
  await api("PHARMACIST", "/api/bills/" + bill.id + "/pay", "POST", payment, 409);
  await api("PHARMACIST", "/api/bill-adjustments", "POST", { action: "review", id: request.result.id, approve: true, note: "E2E forbidden" }, 403);
  await api("ADMIN", "/api/bill-adjustments", "POST", { action: "review", id: request.result.id, approve: true, note: "E2E disetujui" });
  await api("ADMIN", "/api/bill-adjustments", "POST", { action: "review", id: request.result.id, approve: true, note: "E2E duplicate" }, 409);
  await api("PHARMACIST", "/api/bills/" + bill.id + "/pay", "POST", payment, 409);
  payment.expectedTotal = 110000;
  await api("PHARMACIST", "/api/bills/" + bill.id + "/pay", "POST", payment);
  await api("PHARMACIST", "/api/bills/" + bill.id + "/pay", "POST", payment, 409);
  assert.equal((await db.medicine.findUniqueOrThrow({ where: { id: medicineId } })).reservedStock, 2);
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "COMPLETED" });
  await api("PHARMACIST", "/api/prescriptions/" + rxId, "PATCH", { status: "COMPLETED" });
  assert.equal((await db.medicine.findUniqueOrThrow({ where: { id: medicineId } })).stock, 8);
  const refund = await api<{ result: { id: string } }>("PHARMACIST", "/api/bill-adjustments", "POST", { action: "request", id: bill.id, kind: "REFUND", amount: 5000, reason: "E2E refund biaya" });
  await api("PHARMACIST", "/api/bill-adjustments", "POST", { action: "settle", id: refund.result.id, confirmed: true, method: "CASH", reference: "E2E belum disetujui" }, 409);
  await api("ADMIN", "/api/bill-adjustments", "POST", { action: "review", id: refund.result.id, approve: true, note: "E2E refund disetujui" });
  const settlement = { action: "settle", id: refund.result.id, confirmed: true, method: "CASH", reference: "E2E tanda terima" };
  await api("PHARMACIST", "/api/bill-adjustments", "POST", settlement);
  await api("PHARMACIST", "/api/bill-adjustments", "POST", settlement, 409);
  await api("PHARMACIST", "/api/bill-adjustments", "POST", { action: "request", id: bill.id, kind: "REFUND", amount: 110000, reason: "E2E melebihi saldo" }, 409);
  assert.equal((await db.medicine.findUniqueOrThrow({ where: { id: medicineId } })).stock, 8, "Refund does not return medicines to stock");
  // Isolate report assertions by moving only these synthetic financial timestamps to a fixed test day.
  await db.bill.update({ where: { id: bill.id }, data: { paidAt: new Date("2040-01-02T01:00:00Z") } });
  await db.billAdjustment.update({ where: { id: refund.result.id }, data: { settledAt: new Date("2040-01-03T01:00:00Z") } });
  const received = await api<{ gross: number; net: number; consultation: number; medicines: number; corrections: number }>("ADMIN", "/api/payment-reports?from=2040-01-02&to=2040-01-02");
  assert.equal(received.gross, 110000); assert.equal(received.net, 110000);
  assert.equal(received.consultation, 100000); assert.equal(received.medicines, 19000); assert.equal(received.corrections, -9000);
  const returned = await api<{ gross: number; refunded: number; net: number }>("ADMIN", "/api/payment-reports?from=2040-01-03&to=2040-01-03");
  assert.equal(returned.gross, 0); assert.equal(returned.refunded, 5000); assert.equal(returned.net, -5000);
  const plain = await visit(false);
  await api("PHARMACIST", "/api/bills/" + plain.bill.id + "/pay", "POST", { method: "QRIS", receivedAmount: 100000, expectedTotal: 100000, confirmed: true });
  assert.ok((await db.bill.findUniqueOrThrow({ where: { id: plain.bill.id } })).completedAt);
  const today = getClinicDateKey();
  await api("DOCTOR", "/api/payment-reports?from=" + today + "&to=" + today, "GET", undefined, 403);
  const staffEmail = runId + ".newstaff@example.invalid";
  const staffInitial = "Initial-staff-2026!";
  await api("ADMIN", "/api/admin/staff", "POST", { name: "E2E NEW STAFF", email: staffEmail, role: "RECEPTIONIST", password: staffInitial, adminPassword: testPassword });
  const staff = await db.user.findUniqueOrThrow({ where: { email: staffEmail } }); users.push(staff.id);
  assert.equal(staff.mustChangePassword, true);
  const firstLogin = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: staffEmail, password: staffInitial }) });
  assert.equal(firstLogin.status, 200);
  const staffCookie = firstLogin.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
  assert.equal((await fetch(base + "/api/patients", { headers: { Cookie: staffCookie } })).status, 403, "Initial password blocks application APIs");
  const staffPassword = "Changed-staff-2026!";
  assert.equal((await fetch(base + "/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json", Cookie: staffCookie, Origin: base }, body: JSON.stringify({ currentPassword: staffInitial, password: staffPassword }) })).status, 200);
  const changedLogin = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: staffEmail, password: staffPassword }) });
  assert.equal(changedLogin.status, 200);
  await api("ADMIN", "/api/admin/staff", "PATCH", { id: staff.id, isActive: false, adminPassword: testPassword });
  assert.equal((await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: staffEmail, password: staffPassword }) })).status, 401);
  console.log("PASS: patient recovery, visit, stock hold/resume, correction, payment, dispensing, refund, reports, staff creation, initial-password change and deactivation.");
}

async function cleanup() {
  // Exact run-specific IDs/names only. Never delete existing patient/staff data.
  await db.$transaction(async tx => {
    const patients = await tx.patient.findMany({ where: { fullName: patientName }, select: { id: true } });
    const ids = patients.map(p => p.id);
    const visits = await tx.appointment.findMany({ where: { patientId: { in: ids } }, select: { id: true } });
    const visitIds = visits.map(v => v.id);
    await tx.accountAudit.deleteMany({ where: { OR: [{ actorId: { in: users } }, { targetId: { in: users } }] } });
    await tx.billAdjustment.deleteMany({ where: { bill: { appointmentId: { in: visitIds } } } });
    await tx.billItem.deleteMany({ where: { bill: { appointmentId: { in: visitIds } } } });
    await tx.bill.deleteMany({ where: { appointmentId: { in: visitIds } } });
    await tx.prescriptionItem.deleteMany({ where: { prescription: { patientId: { in: ids } } } });
    await tx.prescription.deleteMany({ where: { patientId: { in: ids } } });
    await tx.medicalRecord.deleteMany({ where: { patientId: { in: ids } } });
    if (doctorId) {
      await tx.queueAutoCall.deleteMany({ where: { doctorId } });
      await tx.queueAnnouncement.deleteMany({ where: { doctorId } });
    }
    await tx.queue.deleteMany({ where: { appointmentId: { in: visitIds } } });
    await tx.appointment.deleteMany({ where: { id: { in: visitIds } } });
    await tx.patient.deleteMany({ where: { id: { in: ids } } });
    if (medicineId) { await tx.inventoryTransaction.deleteMany({ where: { medicineId } }); await tx.medicine.delete({ where: { id: medicineId } }); }
    if (doctorId) await tx.doctor.delete({ where: { id: doctorId } });
    if (departmentId) await tx.department.delete({ where: { id: departmentId } });
    await tx.authSession.deleteMany({ where: { userId: { in: users } } });
    await tx.user.deleteMany({ where: { id: { in: users } } });
  }, { maxWait: 30000, timeout: 60000 });
  console.log("Synthetic run data cleaned.");
}

run().catch(error => { console.error(error instanceof Error ? error.message : "E2E failed"); process.exitCode = 1; })
  .finally(async () => { try { await cleanup(); } finally { await db.$disconnect(); } });
