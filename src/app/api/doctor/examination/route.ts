import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, QueueStatus, PrescriptionStatus, Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { parsePrescriptionItems } from "@/lib/prescription-rules";
import { createBill } from "@/features/billing/server/create-bill";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "DOCTOR") {
      return NextResponse.json({ error: "Akses dokter diperlukan." }, { status: 403 });
    }
    const body = await req.json();
    const {
      appointmentId,
      complaint,
      physicalExam,
      diagnosis,
      treatment,
      prescriptionItems: rawPrescriptionItems,
      prescriptionNotes,
    } = body;

    if (typeof appointmentId !== "string" || typeof diagnosis !== "string" || !diagnosis.trim() || diagnosis.length > 5000 ||
      [complaint, physicalExam, treatment, prescriptionNotes].some((value) => value !== undefined && value !== null && (typeof value !== "string" || value.length > 5000))) {
      return NextResponse.json(
        { error: "ID kunjungan dan Diagnosis wajib diisi." },
        { status: 400 }
      );
    }

    let prescriptionItems;
    try { prescriptionItems = parsePrescriptionItems(rawPrescriptionItems); }
    catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
    const medicineCount = await prisma.medicine.count({ where: { id: { in: prescriptionItems.map((item) => item.medicineId) } } });
    if (medicineCount !== prescriptionItems.length) return NextResponse.json({ error: "Obat tidak ditemukan." }, { status: 400 });
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
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.id }, select: { id: true } });
    if (!doctor || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Kunjungan ini bukan milik dokter yang sedang masuk." }, { status: 403 });
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return NextResponse.json({ error: "Pemeriksaan ini sudah selesai." }, { status: 409 });
    }
    if (appointment.status !== AppointmentStatus.IN_EXAMINATION || appointment.queue?.status !== QueueStatus.IN_ROOM) {
      return NextResponse.json({ error: "Mulai pemeriksaan dari antrean dokter sebelum menyelesaikannya." }, { status: 409 });
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
                quantity: item.quantity,
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
      let autoCall = null;
      if (appointment.queue) {
        await tx.queue.update({
          where: { id: appointment.queue.id },
          data: {
            status: QueueStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
        autoCall = await tx.queueAutoCall.create({
          data: {
            doctorId: appointment.doctorId,
            sourceAppointmentId: appointment.id,
            dueAt: new Date(Date.now() + 10_000),
          },
        });
      }

      await createBill(tx, appointment.id);
      return { medicalRecord, prescription, autoCall };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 10_000,
      timeout: 20_000,
    });

    return NextResponse.json({
      success: true,
      medicalRecord: result.medicalRecord,
      prescription: result.prescription,
      autoCall: result.autoCall,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028") {
      return NextResponse.json({ error: "Koneksi database sedang lambat. Data belum tersimpan; silakan tekan Simpan sekali lagi." }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) {
      return NextResponse.json({ error: "Pemeriksaan ini sudah selesai." }, { status: 409 });
    }
    console.error("POST /api/doctor/examination error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan rekam medis dan resep." },
      { status: 500 }
    );
  }
}
