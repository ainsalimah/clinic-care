import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requestAdjustment, reviewAdjustment, settleRefund } from "@/features/billing/server/adjustments";
import { BillingConflict } from "@/features/billing/server/pay-bill";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user || !["ADMIN", "PHARMACIST"].includes(user.role)) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  const params = new URL(req.url).searchParams;
  const status = params.get("status");
  const page = Math.max(1, Math.min(10000, Math.floor(Number(params.get("page")) || 1)));
  const where = status && ["PENDING", "APPROVED", "REJECTED", "SETTLED"].includes(status) ? { status } : {};
  const [entries, count] = await Promise.all([
    prisma.billAdjustment.findMany({ where, include: { bill: { select: { patientName: true, medicalRecordNo: true, total: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, skip: (page - 1) * 20 }),
    prisma.billAdjustment.count({ where }),
  ]);
  return NextResponse.json({ entries, count });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user || !["ADMIN", "PHARMACIST"].includes(user.role)) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  try {
    const body = await req.json();
    if (!body || typeof body.id !== "string") throw new BillingConflict("ID tidak valid.");
    if ((body.action === "review" && user.role !== "ADMIN") || (body.action !== "review" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 403 });
    }
    const result = await prisma.$transaction(async tx => {
      if (body.action === "request") return requestAdjustment(tx, body.id, body.kind, body.amount, body.reason, user);
      if (body.action === "review" && typeof body.approve === "boolean") return reviewAdjustment(tx, body.id, body.approve, body.note, user);
      if (body.action === "settle" && body.confirmed === true) return settleRefund(tx, body.id, body.method, body.reference, user);
      throw new BillingConflict("Tindakan atau konfirmasi tidak valid.");
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof BillingConflict ? error.message : "Permintaan gagal atau data berubah. Muat ulang dan periksa kembali." }, { status: 409 });
  }
}
