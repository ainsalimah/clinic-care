import { Prisma } from "@prisma/client";
import { paymentInput } from "@/lib/billing-rules";

export class BillingConflict extends Error {}

export async function payBill(tx: Prisma.TransactionClient, id: string, method: unknown, received: unknown, cashier: string, expectedTotal?: number) {
  await tx.$queryRaw`SELECT "id" FROM "Bill" WHERE "id" = ${id} FOR UPDATE`;
  const bill = await tx.bill.findUnique({ where: { id }, include: {
    appointment: { include: { record: { include: { prescription: { include: { items: { include: { medicine: true } } } } } } } },
  } });
  if (!bill) throw new BillingConflict("Tagihan tidak ditemukan.");
  if (bill.paidAt) throw new BillingConflict("Tagihan sudah lunas. Pembayaran tidak dicatat ulang.");
  if (expectedTotal !== undefined && expectedTotal !== bill.total) throw new BillingConflict("Total tagihan berubah. Muat ulang rincian sebelum menerima pembayaran.");
  const pending = await tx.billAdjustment.count({ where: { billId: id, kind: "CORRECTION", status: "PENDING" } });
  if (pending) throw new BillingConflict("Tunggu keputusan admin atas koreksi tagihan sebelum menerima pembayaran.");
  const payment = paymentInput(method, received, bill.total);
  const rx = bill.appointment.record?.prescription;
  if (rx && rx.status !== "READY") throw new BillingConflict("Siapkan obat dan tandai siap diambil sebelum menerima pembayaran.");
  // Reserve paid medicines without dispensing: another cashier cannot sell the same units.
  for (const item of [...(rx?.items ?? [])].sort((a, b) => a.medicineId.localeCompare(b.medicineId))) {
    const reserved = await tx.$executeRaw`
      UPDATE "Medicine" SET "reservedStock" = "reservedStock" + ${item.quantity}
      WHERE "id" = ${item.medicineId} AND "stock" - "reservedStock" >= ${item.quantity}
    `;
    if (reserved !== 1) throw new BillingConflict("Stok tersedia tidak cukup. Lengkapi stok sebelum menerima pembayaran.");
  }
  const result = await tx.bill.updateMany({
    where: { id, paidAt: null },
    data: { paidAt: new Date(), paymentMethod: payment.method, receivedAmount: payment.amount,
      receivedBy: cashier, ...(!rx ? { completedAt: new Date() } : {}) },
  });
  if (result.count !== 1) throw new BillingConflict("Tagihan telah dibayar petugas lain. Muat ulang.");
  return { success: true };
}
