import { Prisma, PrescriptionStatus } from "@prisma/client";
import { canTransitionPrescription } from "@/lib/prescription-rules";

export class PrescriptionConflict extends Error {}

export async function updatePrescription(tx: Prisma.TransactionClient, id: string, status: PrescriptionStatus, notes?: string) {
  const prescription = await tx.prescription.findUnique({ where: { id }, include: { items: true } });
  if (!prescription) throw new PrescriptionConflict("Resep tidak ditemukan.");
  if (prescription.stockHeldAt && !prescription.stockResumedAt) throw new PrescriptionConflict("Resep ditunda menunggu stok. Lanjutkan resep melalui tombol stok tersedia terlebih dahulu.");
  if (!canTransitionPrescription(prescription.status, status)) throw new PrescriptionConflict("Urutan status resep tidak valid. Resep selesai/dibatalkan tidak dapat dibuka kembali.");
  if (prescription.status === status) return prescription;
  if (status === "READY") {
    for (const item of prescription.items) {
      const available = await tx.medicine.findUnique({ where: { id: item.medicineId }, select: { stock: true, reservedStock: true } });
      if (!available || available.stock - available.reservedStock < item.quantity) throw new PrescriptionConflict("Stok obat belum mencukupi. Tunda resep sampai stok tersedia.");
    }
  }
  const bill = await tx.bill.findFirst({ where: { appointment: { record: { id: prescription.medicalRecordId } } } });
  if (bill && status === "CANCELLED") throw new PrescriptionConflict("Resep sudah masuk tagihan. Pembatalan memerlukan koreksi tagihan; hubungi penanggung jawab.");
  if (bill && status === "COMPLETED" && !bill.paidAt) throw new PrescriptionConflict("Lunasi tagihan konsultasi dan obat sebelum penyerahan.");
  const claimed = await tx.prescription.updateMany({
    where: { id, status: prescription.status },
    data: { status, ...(notes === undefined ? {} : { notes }), ...(status === "COMPLETED" ? { dispensedAt: new Date() } : {}) },
  });
  if (claimed.count !== 1) throw new PrescriptionConflict("Resep sedang diproses petugas lain. Muat ulang.");
  if (status === "COMPLETED") {
    if (!prescription.items.length) throw new PrescriptionConflict("Resep tidak memiliki obat.");
    for (const item of [...prescription.items].sort((a, b) => a.medicineId.localeCompare(b.medicineId))) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) throw new PrescriptionConflict("Jumlah obat pada resep tidak valid. Hubungi dokter.");
      const stock = bill
        ? await tx.$executeRaw`UPDATE "Medicine" SET "stock" = "stock" - ${item.quantity},
            "reservedStock" = "reservedStock" - ${item.quantity}, "updatedAt" = NOW()
            WHERE "id" = ${item.medicineId} AND "stock" >= ${item.quantity} AND "reservedStock" >= ${item.quantity}`
        : await tx.$executeRaw`UPDATE "Medicine" SET "stock" = "stock" - ${item.quantity}, "updatedAt" = NOW()
            WHERE "id" = ${item.medicineId} AND "stock" - "reservedStock" >= ${item.quantity}`;
      if (stock !== 1) throw new PrescriptionConflict("Stok obat tidak mencukupi. Seluruh penyerahan dibatalkan.");
      await tx.inventoryTransaction.create({ data: {
        medicineId: item.medicineId, type: "OUT", quantity: item.quantity,
        referenceId: id, notes: "Penyerahan resep",
      } });
    }
    if (bill) await tx.bill.update({ where: { id: bill.id }, data: { completedAt: new Date() } });
  }
  return tx.prescription.findUniqueOrThrow({ where: { id }, include: { items: { include: { medicine: true } } } });
}
