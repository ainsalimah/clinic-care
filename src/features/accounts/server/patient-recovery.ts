import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export type PatientIdentity = {
  nik: unknown;
  dateOfBirth: unknown;
  phone: unknown;
};

function digits(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export function createTemporaryPassword() {
  return `Kc!9a-${randomBytes(16).toString("base64url")}`;
}

function verifyIdentity(
  patient: { nik: string | null; dateOfBirth: Date; phone: string | null },
  identity: PatientIdentity,
) {
  const nik = digits(identity.nik);
  const phone = digits(identity.phone);
  const dob = typeof identity.dateOfBirth === "string" ? identity.dateOfBirth : "";
  if (!/^\d{16}$/.test(nik) || !/^\d{8,15}$/.test(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    throw new Error("Isi NIK, tanggal lahir, dan nomor telepon dengan lengkap.");
  }
  if (patient.nik !== nik || patient.dateOfBirth.toISOString().slice(0, 10) !== dob || digits(patient.phone) !== phone) {
    throw new Error("Data verifikasi tidak cocok dengan akun pasien.");
  }
}

export async function recoverPatientAccount(
  tx: Prisma.TransactionClient,
  actorId: string,
  patientId: string,
  identity: PatientIdentity,
  resetPassword: boolean,
) {
  await tx.$queryRaw`SELECT "id" FROM "Patient" WHERE "id" = ${patientId} FOR UPDATE`;
  const patient = await tx.patient.findUnique({ where: { id: patientId }, include: { user: true } });
  if (!patient?.user || patient.user.role !== "PATIENT" || !patient.user.isActive) {
    throw new Error("Akun pasien tidak tersedia atau sedang nonaktif.");
  }
  verifyIdentity(patient, identity);

  if (!resetPassword) {
    await tx.accountAudit.create({ data: { actorId, targetId: patient.user.id, action: "PATIENT_ACCOUNT_IDENTIFIED" } });
    return { email: patient.user.email, maskedEmail: maskEmail(patient.user.email) };
  }

  const temporaryPassword = createTemporaryPassword();
  await tx.user.update({
    where: { id: patient.user.id },
    data: { passwordHash: await bcrypt.hash(temporaryPassword, 12), mustChangePassword: true },
  });
  await tx.authSession.deleteMany({ where: { userId: patient.user.id } });
  await tx.passwordReset.deleteMany({ where: { userId: patient.user.id } });
  await tx.accountAudit.create({ data: { actorId, targetId: patient.user.id, action: "PATIENT_PASSWORD_TEMPORARY" } });
  return { email: patient.user.email, maskedEmail: maskEmail(patient.user.email), temporaryPassword };
}
