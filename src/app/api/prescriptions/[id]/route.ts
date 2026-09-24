import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrescriptionStatus, InventoryTransactionType } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await req.json();

    if (!status || !Object.values(PrescriptionStatus).includes(status as PrescriptionStatus)) {
      return NextResponse.json({ error: "Status resep tidak valid." }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Resep tidak ditemukan." }, { status: 404 });
    }

    // Jika status diubah menjadi COMPLETED (Diserahkan ke Pasien), lakukan pengurangan stok otomatis
    if (status === PrescriptionStatus.COMPLETED && prescription.status !== PrescriptionStatus.COMPLETED) {
      const updatedPrescription = await prisma.$transaction(async (tx) => {
        // 1. Kurangi stok setiap obat & catat transaksi mutasi
        for (const item of prescription.items) {
          await tx.medicine.update({
            where: { id: item.medicineId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              medicineId: item.medicineId,
              type: InventoryTransactionType.OUT,
              quantity: item.quantity,
              notes: `Penyerahan resep pasien: ${prescription.patient.fullName} (${prescription.patient.medicalRecordNo})`,
              referenceId: prescription.id,
            },
          });
        }

        // 2. Update status resep dan waktu penyerahan
        return await tx.prescription.update({
          where: { id },
          data: {
            status: PrescriptionStatus.COMPLETED,
            dispensedAt: new Date(),
            notes: notes !== undefined ? notes : prescription.notes,
          },
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        });
      });

      return NextResponse.json({ success: true, prescription: updatedPrescription });
    }

    // Pembaruan status biasa (PROCESSING, READY, CANCELLED)
    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        status: status as PrescriptionStatus,
        notes: notes !== undefined ? notes : prescription.notes,
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prescription: updated });
  } catch (error) {
    console.error("PATCH /api/prescriptions/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status resep dan stok obat." }, { status: 500 });
  }
}
