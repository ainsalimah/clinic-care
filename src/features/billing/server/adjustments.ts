import { Prisma } from "@prisma/client";
import { rupiahAmount } from "@/lib/billing-rules";
import { BillingConflict } from "./pay-bill";

type Actor = { id: string; name: string; role: string };
function text(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length < 5 || value.length > 1000) throw new BillingConflict(label + " harus 5–1000 karakter.");
  return value.trim();
}
export async function requestAdjustment(tx: Prisma.TransactionClient, billId: string, kind: unknown, amount: unknown, reason: unknown, actor: Actor) {
  if (actor.role !== "PHARMACIST") throw new BillingConflict("Hanya apoteker dapat mengajukan.");
  await tx.$queryRaw`SELECT "id" FROM "Bill" WHERE "id" = ${billId} FOR UPDATE`;
  const bill = await tx.bill.findUnique({ where: { id: billId }, include: { adjustments: true } });
  if (!bill) throw new BillingConflict("Tagihan tidak ditemukan.");
  if (kind !== "CORRECTION" && kind !== "REFUND") throw new BillingConflict("Jenis pengajuan tidak valid.");
  if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount === 0 || Math.abs(amount) > 2_000_000_000) throw new BillingConflict("Nominal penyesuaian tidak valid.");
  if (kind === "CORRECTION") {
    if (bill.paidAt) throw new BillingConflict("Tagihan lunas tidak dapat dikoreksi. Gunakan pengajuan refund.");
    rupiahAmount(bill.total + amount);
    if (bill.adjustments.some(a => a.kind === kind && a.status === "PENDING")) throw new BillingConflict("Masih ada koreksi yang menunggu keputusan.");
  } else {
    if (!bill.paidAt || amount < 1) throw new BillingConflict("Refund hanya untuk tagihan lunas.");
    const allocated = bill.adjustments.filter(a => a.kind === "REFUND" && a.status !== "REJECTED").reduce((sum, a) => sum + a.amount, 0);
    if (amount + allocated > bill.total) throw new BillingConflict("Refund melebihi saldo pembayaran yang bisa dikembalikan.");
  }
  return tx.billAdjustment.create({ data: { billId, kind, amount, reason: text(reason, "Alasan"), requestedById: actor.id, requestedBy: actor.name } });
}

export async function reviewAdjustment(tx: Prisma.TransactionClient, id: string, approve: boolean, note: unknown, actor: Actor) {
  if (actor.role !== "ADMIN") throw new BillingConflict("Persetujuan admin diperlukan.");
  const initial = await tx.billAdjustment.findUniqueOrThrow({ where: { id } });
  await tx.$queryRaw`SELECT "id" FROM "Bill" WHERE "id" = ${initial.billId} FOR UPDATE`;
  const entry = await tx.billAdjustment.findUniqueOrThrow({ where: { id }, include: { bill: true } });
  if (entry.status !== "PENDING") throw new BillingConflict("Pengajuan sudah diputuskan.");
  if (entry.requestedById === actor.id) throw new BillingConflict("Pengaju tidak boleh menyetujui pengajuan sendiri.");
  const reviewNote = text(note, "Catatan keputusan");
  if (approve && entry.kind === "CORRECTION") {
    if (entry.bill.paidAt) throw new BillingConflict("Tagihan sudah dibayar.");
    const total = rupiahAmount(entry.bill.total + entry.amount);
    await tx.bill.update({ where: { id: entry.billId }, data: { total } });
  }
  return tx.billAdjustment.update({ where: { id }, data: {
    status: approve ? "APPROVED" : "REJECTED", reviewedById: actor.id, reviewedBy: actor.name,
    reviewedAt: new Date(), reviewNote,
  } });
}

export async function settleRefund(tx: Prisma.TransactionClient, id: string, method: unknown, reference: unknown, actor: Actor) {
  if (actor.role !== "PHARMACIST") throw new BillingConflict("Akses apoteker diperlukan.");
  if (method !== "CASH" && method !== "TRANSFER") throw new BillingConflict("Pilih tunai atau transfer.");
  const settlementReference = text(reference, "Bukti/rujukan pengembalian");
  const entry = await tx.billAdjustment.findUniqueOrThrow({ where: { id } });
  await tx.$queryRaw`SELECT "id" FROM "Bill" WHERE "id" = ${entry.billId} FOR UPDATE`;
  const updated = await tx.billAdjustment.updateMany({
    where: { id, kind: "REFUND", status: "APPROVED" },
    data: { status: "SETTLED", settledAt: new Date(), settledById: actor.id, settledBy: actor.name, settlementMethod: method, settlementReference },
  });
  if (updated.count !== 1) throw new BillingConflict("Refund belum disetujui atau sudah dikembalikan.");
  return { success: true };
}
