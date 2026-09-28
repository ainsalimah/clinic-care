import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { validatePassword } from "@/lib/password-rules";

export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function issuePasswordReset(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.isActive) throw new Error("Akun tidak aktif.");
  const token = randomBytes(32).toString("hex");
  await tx.passwordReset.deleteMany({ where: { userId } });
  const reset = await tx.passwordReset.create({ data: { userId, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 30 * 60_000) } });
  return { token, id: reset.id };
}

export async function resetPassword(tx: Prisma.TransactionClient, token: string, passwordHash: string) {
  const initial = await tx.passwordReset.findUnique({ where: { tokenHash: hashResetToken(token) } });
  if (!initial) throw new Error("Tautan tidak valid atau sudah kedaluwarsa.");
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${initial.userId} FOR UPDATE`;
  const reset = await tx.passwordReset.findUnique({ where: { id: initial.id }, include: { user: true } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date() || !reset.user.isActive) throw new Error("Tautan tidak valid atau sudah kedaluwarsa.");
  await tx.user.update({ where: { id: reset.userId }, data: { passwordHash, mustChangePassword: false } });
  await tx.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
  await tx.authSession.deleteMany({ where: { userId: reset.userId } });
  await tx.accountAudit.create({ data: { actorId: reset.userId, targetId: reset.userId, action: "PASSWORD_RESET" } });
}

export async function changePassword(tx: Prisma.TransactionClient, userId: string, current: unknown, next: unknown) {
  const password = validatePassword(next);
  if (typeof current !== "string" || Buffer.byteLength(current) > 72) throw new Error("Kata sandi saat ini tidak valid.");
  if (current === password) throw new Error("Kata sandi baru harus berbeda.");
  await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.isActive || !await bcrypt.compare(current, user.passwordHash)) throw new Error("Kata sandi saat ini tidak valid.");
  await tx.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: false } });
  await tx.authSession.deleteMany({ where: { userId } });
  await tx.passwordReset.deleteMany({ where: { userId } });
  await tx.accountAudit.create({ data: { actorId: userId, targetId: userId, action: "PASSWORD_CHANGED" } });
}
