import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  if ((await getSession())?.role !== "PHARMACIST") return NextResponse.json({ error: "Akses apoteker diperlukan." }, { status: 403 });
  const params = new URL(req.url).searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  const paid = params.get("paid");
  const page = Math.max(1, Math.min(10000, Number(params.get("page")) || 1));
  const where = {
    ...(paid === "yes" ? { paidAt: { not: null } } : paid === "no" ? { paidAt: null } : {}),
    ...(q ? { OR: [{ patientName: { contains: q, mode: "insensitive" as const } }, { medicalRecordNo: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [bills, count] = await Promise.all([
    prisma.bill.findMany({ where, include: {
      adjustments: { orderBy: { createdAt: "asc" } },
      items: { orderBy: { id: "asc" } },
      appointment: { select: { record: { select: { prescription: { select: { id: true, status: true, stockHeldAt: true, stockResumedAt: true, stockHoldReason: true } } } } } },
    }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, skip: (Math.floor(page) - 1) * 20 }),
    prisma.bill.count({ where }),
  ]);
  return NextResponse.json({ bills, count });
}
