import { Prisma, PrescriptionStatus } from "@prisma/client";
import { canTransitionPrescription } from "@/lib/prescription-rules";

export class PrescriptionConflict extends Error {}

export async function updatePrescription(tx: Prisma.TransactionClient, id: string, status: PrescriptionStatus, notes?: string) {
  const prescription = await tx.prescription.findUnique({ where: { id }, include: { items: true } });
  if (!prescription) throw new PrescriptionConflict("Resep tidak ditemukan.");
  if (!canTransitionPrescription(prescription.status, status)) throw new PrescriptionConflict("Urutan status resep tidak valid. Resep selesai/dibatalkan tidak dapat dibuka kembali.");
  if (prescription.status === status) return prescription;
  const claimed = await tx.prescription.updateMany({
    where: { id, status: prescription.status },
    data: { status, ...(notes === undefined ? {} : { notes }), ...(status === "COMPLETED" ? { dispensedAt: new Date() } : {}) },
  });
  if (claimed.count !== 1) throw new PrescriptionConflict("Resep sedang diproses petugas lain. Muat ulang.");
  if (status === "COMPLETED") {
    if (!prescription.items.length) throw new PrescriptionConflict("Resep tidak memiliki obat.");
    for (const item of [...prescription.items].sort((a, b) => a.medicineId.localeCompare(b.medicineId))) {
      if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) throw new PrescriptionConflict("Jumlah obat pada resep tidak valid. Hubungi dokter.");
      const stock = await tx.medicine.updateMany({
        where: { id: item.medicineId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (stock.count !== 1) throw new PrescriptionConflict("Stok obat tidak mencukupi. Seluruh penyerahan dibatalkan.");
      await tx.inventoryTransaction.create({ data: {
        medicineId: item.medicineId, type: "OUT", quantity: item.quantity,
        referenceId: id, notes: "Penyerahan resep",
      } });
    }
  }
  return tx.prescription.findUniqueOrThrow({ where: { id }, include: { items: { include: { medicine: true } } } });
}
