import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, QueueStatus, PrescriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      appointmentId,
      complaint,
      physicalExam,
      diagnosis,
      treatment,
      prescriptionItems,
      prescriptionNotes,
    } = body;

    if (!appointmentId || !diagnosis) {
      return NextResponse.json(
        { error: "ID kunjungan dan Diagnosis wajib diisi." },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { queue: true, record: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Kunjungan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Gunakan transaction untuk memastikan integritas
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat atau update Rekam Medis
      let medicalRecord;
      if (appointment.record) {
        medicalRecord = await tx.medicalRecord.update({
          where: { id: appointment.record.id },
          data: {
            complaint,
            physicalExam,
            diagnosis,
            treatment,
          },
        });
      } else {
        medicalRecord = await tx.medicalRecord.create({
          data: {
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            complaint,
            physicalExam,
            diagnosis,
            treatment,
          },
        });
      }

      // 2. Buat Resep Digital jika ada obat yang diresepkan
      let prescription = null;
      if (prescriptionItems && Array.isArray(prescriptionItems) && prescriptionItems.length > 0) {
        prescription = await tx.prescription.create({
          data: {
            medicalRecordId: medicalRecord.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            status: PrescriptionStatus.PENDING,
            notes: prescriptionNotes || null,
            items: {
              create: prescriptionItems.map((item: {
                medicineId: string;
                dosage: string;
                quantity: number;
                instruction: string;
              }) => ({
                medicineId: item.medicineId,
                dosage: item.dosage,
                quantity: Number(item.quantity) || 1,
                instruction: item.instruction,
              })),
            },
          },
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        });
      }

      // 3. Selesaikan status Appointment
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: AppointmentStatus.COMPLETED },
      });

      // 4. Selesaikan status Queue jika ada
      if (appointment.queue) {
        await tx.queue.update({
          where: { id: appointment.queue.id },
          data: {
            status: QueueStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      return { medicalRecord, prescription };
    });

    return NextResponse.json({
      success: true,
      medicalRecord: result.medicalRecord,
      prescription: result.prescription,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/doctor/examination error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan rekam medis dan resep." },
      { status: 500 }
    );
  }
}
