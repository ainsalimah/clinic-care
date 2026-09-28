import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { payBill, BillingConflict } from "@/features/billing/server/pay-bill";
import { paymentInput } from "@/lib/billing-rules";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (user?.role !== "PHARMACIST") return NextResponse.json({ error: "Akses apoteker diperlukan." }, { status: 403 });
  let body;
  try {
    body = await req.json();
    paymentInput(body.method, body.receivedAmount, body.receivedAmount);
    if (body.confirmed !== true) throw new Error("Konfirmasi uang sudah diterima.");
    if (!Number.isSafeInteger(body.expectedTotal) || body.expectedTotal < 0) throw new Error("Muat ulang rincian tagihan.");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Data pembayaran tidak valid." }, { status: 400 });
  }
  try {
    const { id } = await params;
    return NextResponse.json(await prisma.$transaction(
      tx => payBill(tx, id, body.method, body.receivedAmount, user.name, body.expectedTotal),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 15000 },
    ));
  } catch (error) {
    if (error instanceof BillingConflict || (error instanceof Prisma.PrismaClientKnownRequestError && ["P2028", "P2034"].includes(error.code))) {
      return NextResponse.json({ error: error instanceof BillingConflict ? error.message : "Tagihan sedang diperbarui. Muat ulang." }, { status: 409 });
    }
    return NextResponse.json({ error: "Pembayaran gagal. Periksa nominal dan muat ulang tagihan sebelum mencoba lagi." }, { status: 400 });
  }
}
