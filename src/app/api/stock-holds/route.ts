import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { setStockHold } from "@/features/pharmacy/server/stock-hold";
import { PrescriptionConflict } from "@/features/pharmacy/server/update-prescription";
export async function POST(req: Request) {
  const user = await getSession();
  if (user?.role !== "PHARMACIST") return NextResponse.json({ error: "Akses apoteker diperlukan." }, { status: 403 });
  try {
    const body = await req.json();
    if (typeof body.id !== "string" || typeof body.hold !== "boolean") throw new PrescriptionConflict("Permintaan tidak valid.");
    await prisma.$transaction(tx => setStockHold(tx, body.id, body.hold, body.reason, user.name), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 15000 });
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof PrescriptionConflict ? error.message : "Data berubah atau tidak ditemukan. Muat ulang resep." }, { status: 409 }); }
}
