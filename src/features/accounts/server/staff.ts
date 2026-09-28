import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/password-rules";

export type StaffInput = { name: string; email: string; role: Role; password: string; departmentId?: string; dayOfWeek?: number; startTime?: string; endTime?: string; quota?: number };
export async function createStaff(tx: Prisma.TransactionClient, input: StaffInput, actorId: string) {
  if (!input || typeof input.name !== "string" || !input.name.trim() || input.name.length > 100 || typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("Nama dan email staf tidak valid.");
  if (!["ADMIN", "RECEPTIONIST", "PHARMACIST", "DOCTOR"].includes(input.role)) throw new Error("Pilih peran staf yang valid.");
  const passwordHash = await bcrypt.hash(validatePassword(input.password), 12);
  if (input.role === "DOCTOR") {
    if (!input.departmentId || !await tx.department.findUnique({ where: { id: input.departmentId } })) throw new Error("Poli dokter tidak valid.");
    if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek! < 0 || input.dayOfWeek! > 6 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startTime ?? "") || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.endTime ?? "") || input.startTime! >= input.endTime! || !Number.isInteger(input.quota) || input.quota! < 1 || input.quota! > 200) throw new Error("Jadwal dokter tidak valid.");
  }
  const user = await tx.user.create({ data: { name: input.name.trim(), email: input.email.trim().toLowerCase(), role: input.role, passwordHash, mustChangePassword: true } });
  if (input.role === "DOCTOR") await tx.doctor.create({ data: { userId: user.id, fullName: user.name, departmentId: input.departmentId!, schedules: { create: { departmentId: input.departmentId!, dayOfWeek: input.dayOfWeek!, startTime: input.startTime!, endTime: input.endTime!, quota: input.quota! } } } });
  await tx.accountAudit.create({ data: { actorId, targetId: user.id, action: "STAFF_CREATED:" + user.role } });
  return { id: user.id };
}

export async function setStaffActive(tx: Prisma.TransactionClient, actorId: string, id: string, isActive: boolean) {
  if (id === actorId) throw new Error("Status akun sendiri tidak dapat diubah.");
  const user = await tx.user.findUniqueOrThrow({ where: { id }, include: { doctor: true } });
  if (user.role === "PATIENT") throw new Error("Halaman ini hanya mengelola staf.");
  if (!isActive && user.doctor && await tx.appointment.count({ where: { doctorId: user.doctor.id, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_EXAMINATION"] } } })) throw new Error("Dokter masih memiliki kunjungan aktif. Selesaikan atau atur ulang kunjungan terlebih dahulu.");
  if (user.isActive === isActive) return;
  await tx.user.update({ where: { id }, data: { isActive } });
  await tx.authSession.deleteMany({ where: { userId: id } });
  await tx.passwordReset.deleteMany({ where: { userId: id } });
  await tx.accountAudit.create({ data: { actorId, targetId: id, action: isActive ? "STAFF_ACTIVATED" : "STAFF_DEACTIVATED" } });
}
