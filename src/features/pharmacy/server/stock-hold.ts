import { Prisma } from "@prisma/client";
import { PrescriptionConflict } from "./update-prescription";
export async function setStockHold(tx: Prisma.TransactionClient, id: string, hold: boolean, reason: unknown, actor: string) {
  const initial = await tx.prescription.findUniqueOrThrow({ where: { id }, include: { medicalRecord: true } });
  await tx.$queryRaw`SELECT "id" FROM "Bill" WHERE "appointmentId" = ${initial.medicalRecord.appointmentId} FOR UPDATE`;
  const rx = await tx.prescription.findUniqueOrThrow({ where: { id }, include: { items: { include: { medicine: true } }, medicalRecord: { include: { appointment: { include: { bill: true } } } } } });
  if (["COMPLETED", "CANCELLED"].includes(rx.status) || rx.medicalRecord.appointment.bill?.paidAt) throw new PrescriptionConflict("Hanya resep aktif yang belum dibayar dapat ditunda atau dilanjutkan.");
  const shortage = rx.items.some(i => i.medicine.stock - i.medicine.reservedStock < i.quantity);
  if (hold) {
    if (rx.stockHeldAt && !rx.stockResumedAt) throw new PrescriptionConflict("Resep sudah ditunda.");
    if (!shortage) throw new PrescriptionConflict("Stok tersedia mencukupi; muat ulang rincian resep.");
    if (typeof reason !== "string" || reason.trim().length < 5 || reason.length > 500) throw new PrescriptionConflict("Isi alasan 5–500 karakter.");
    return tx.prescription.update({ where: { id }, data: { status: "PROCESSING", stockHoldReason: reason.trim(), stockHeldAt: new Date(), stockHeldBy: actor, stockResumedAt: null, stockResumedBy: null } });
  }
  if (!rx.stockHeldAt || rx.stockResumedAt) throw new PrescriptionConflict("Resep tidak sedang ditunda.");
  if (shortage) throw new PrescriptionConflict("Stok belum mencukupi. Tambahkan stok melalui menu Obat & Stok terlebih dahulu.");
  return tx.prescription.update({ where: { id }, data: { status: "PROCESSING", stockResumedAt: new Date(), stockResumedBy: actor } });
}
