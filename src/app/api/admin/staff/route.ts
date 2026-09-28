import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { createStaff, setStaffActive } from "@/features/accounts/server/staff";

export async function GET(req: Request) {
  const actor = await getSession();
  if (actor?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").slice(0, 100);
  const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
  const where: Prisma.UserWhereInput = { role: { not: "PATIENT" }, OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] };
  const [users, count] = await Promise.all([
    prisma.user.findMany({ where, select: { id: true, name: true, email: true, role: true, isActive: true, mustChangePassword: true, doctor: { select: { department: { select: { name: true } }, schedules: true } } }, orderBy: [{ createdAt: "desc" }, { id: "asc" }], take: 20, skip: (Math.floor(page) - 1) * 20 }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ users: users.map(user => ({ ...user, canChangeStatus: user.id !== actor.id })), count });
}
async function mutate(req: Request, create: boolean) {
  const actor = await getSession();
  if (actor?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const limited = await consumeRateLimit(rateLimitKey("staff-edit", actor.id), 15, 15 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  try {
    const body = await req.json();
    await prisma.$transaction(async tx => {
      const admin = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
      if (!admin.isActive || admin.role !== "ADMIN" || typeof body.adminPassword !== "string" || Buffer.byteLength(body.adminPassword) > 72 || !await bcrypt.compare(body.adminPassword, admin.passwordHash)) throw new Error("Kata sandi admin tidak sesuai.");
      if (create) return createStaff(tx, body, actor.id);
      if (typeof body.id !== "string" || typeof body.isActive !== "boolean") throw new Error("Status akun tidak valid.");
      return setStaffActive(tx, actor.id, body.id, body.isActive);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 15000 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Prisma.PrismaClientKnownRequestError ? "Email sudah digunakan atau data berubah. Muat ulang dan coba lagi." : error instanceof Error ? error.message : "Gagal memperbarui akun.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
export const POST = (req: Request) => mutate(req, true);
export const PATCH = (req: Request) => mutate(req, false);
