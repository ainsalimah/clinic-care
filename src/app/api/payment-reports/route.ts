import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { reportRange } from "@/lib/payment-report";

export async function GET(req: Request) {
  if (!["ADMIN", "PHARMACIST"].includes((await getSession())?.role ?? "")) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  try {
    const params = new URL(req.url).searchParams;
    const { start, end } = reportRange(params.get("from"), params.get("to"));
    const paidAt = { gte: start, lt: end };
    const data = await prisma.$transaction(async tx => {
      const payments = await tx.bill.groupBy({ by: ["paymentMethod"], where: { paidAt }, _sum: { total: true }, _count: true });
      const refunds = await tx.billAdjustment.groupBy({ by: ["settlementMethod"], where: { kind: "REFUND", status: "SETTLED", settledAt: paidAt }, _sum: { amount: true }, _count: true });
      const consultation = await tx.billItem.aggregate({ where: { bill: { paidAt }, kind: "CONSULTATION" }, _sum: { amount: true } });
      const medicines = await tx.billItem.aggregate({ where: { bill: { paidAt }, kind: "MEDICINE" }, _sum: { amount: true } });
      const corrections = await tx.billAdjustment.aggregate({ where: { kind: "CORRECTION", status: "APPROVED", bill: { paidAt } }, _sum: { amount: true } });
      const unpaid = await tx.bill.aggregate({ where: { paidAt: null, createdAt: paidAt }, _sum: { total: true }, _count: true });
      const pendingRefunds = await tx.billAdjustment.aggregate({ where: { kind: "REFUND", status: "APPROVED" }, _sum: { amount: true }, _count: true });
      const gross = payments.reduce((sum, item) => sum + (item._sum.total ?? 0), 0);
      const refunded = refunds.reduce((sum, item) => sum + (item._sum.amount ?? 0), 0);
      return { payments, refunds, gross, refunded, net: gross - refunded,
        consultation: consultation._sum.amount ?? 0, medicines: medicines._sum.amount ?? 0,
        corrections: corrections._sum.amount ?? 0,
        unpaid: { count: unpaid._count, total: unpaid._sum.total ?? 0 },
        pendingRefunds: { count: pendingRefunds._count, total: pendingRefunds._sum.amount ?? 0 },
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal memuat laporan. Pilih rentang tanggal valid maksimal 31 hari." }, { status: 400 });
  }
}
