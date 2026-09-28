import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { consumeRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { recoverPatientAccount } from "@/features/accounts/server/patient-recovery";

export async function GET(req: Request) {
  const actor = await getSession();
  if (actor?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
  const searchDigits = q.replace(/\D/g, "");
  const where: Prisma.PatientWhereInput = {
    user: { isNot: null },
    ...(q ? { OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { medicalRecordNo: { contains: q, mode: "insensitive" } },
      ...(searchDigits ? [{ nik: { contains: searchDigits } }, { phone: { contains: searchDigits } }] : []),
    ] } : {}),
  };
  const [patients, count] = await Promise.all([
    prisma.patient.findMany({
      where,
      select: { id: true, fullName: true, medicalRecordNo: true, user: { select: { isActive: true, mustChangePassword: true } } },
      orderBy: [{ fullName: "asc" }, { id: "asc" }], take: 20, skip: (page - 1) * 20,
    }),
    prisma.patient.count({ where }),
  ]);
  return NextResponse.json({
    patients: patients.map(patient => ({
      id: patient.id,
      fullName: patient.fullName,
      medicalRecordNo: patient.medicalRecordNo,
      isActive: patient.user!.isActive,
      mustChangePassword: patient.user!.mustChangePassword,
    })),
    count,
  });
}

export async function POST(req: Request) {
  const actor = await getSession();
  if (actor?.role !== "ADMIN") return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
  const limited = await consumeRateLimit(rateLimitKey("patient-recovery", actor.id), 10, 15 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  try {
    const body = await req.json();
    if (typeof body.patientId !== "string" || !["identify", "reset"].includes(body.action)) {
      return NextResponse.json({ error: "Permintaan pemulihan tidak valid." }, { status: 400 });
    }
    const result = await prisma.$transaction(async tx => {
      const admin = await tx.user.findUniqueOrThrow({ where: { id: actor.id } });
      if (!admin.isActive || admin.role !== "ADMIN" || typeof body.adminPassword !== "string" || Buffer.byteLength(body.adminPassword) > 72 || !await bcrypt.compare(body.adminPassword, admin.passwordHash)) {
        throw new Error("Kata sandi admin tidak sesuai.");
      }
      return recoverPatientAccount(tx, actor.id, body.patientId, body, body.action === "reset");
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 15000 });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pemulihan akun gagal.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
