import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { getClinicDateKey } from "@/lib/clinic-time";
import { createQueue } from "@/features/queue/server/create-queue";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "RECEPTIONIST") {
      return NextResponse.json({ error: "Check-in hanya dapat dilakukan resepsionis." }, { status: 403 });
    }

    const { appointmentId, patientId, departmentId, doctorId, notes } = await req.json();

    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true, doctor: true, department: true, queue: true },
      });
      if (!appointment) return NextResponse.json({ error: "Jadwal kunjungan tidak ditemukan." }, { status: 404 });
      if (appointment.status !== AppointmentStatus.CONFIRMED) return NextResponse.json({ error: "Jadwal harus dikonfirmasi sebelum check-in." }, { status: 409 });
      if (appointment.queue) return NextResponse.json({ error: "Kunjungan ini sudah memiliki nomor antrean." }, { status: 409 });

      const now = new Date();
      const todayKey = getClinicDateKey(now);
      if (appointment.appointmentDate.toISOString().slice(0, 10) !== todayKey) {
        return NextResponse.json({ error: "Check-in hanya dapat dilakukan pada tanggal kunjungan." }, { status: 400 });
      }

      const queue = await prisma.$transaction(async (tx) => {
        const created = await createQueue(tx, appointment.id, appointment.department, now);
        await tx.appointment.update({ where: { id: appointment.id }, data: { status: AppointmentStatus.CHECKED_IN } });
        return created;
      });

      return NextResponse.json({
        success: true,
        queue,
        ticket: {
          queueNumber: queue.queueNumber,
          patientName: appointment.patient.fullName,
          medicalRecordNo: appointment.patient.medicalRecordNo,
          nik: appointment.patient.nik,
          departmentName: appointment.department.name,
          doctorName: appointment.doctor.fullName,
          time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          date: now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        },
      }, { status: 201 });
    }

    if (!patientId || !departmentId || !doctorId) {
      return NextResponse.json(
        { error: "Pasien, Poli, dan Dokter wajib dipilih." },
        { status: 400 }
      );
    }

    const [patient, department, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.department.findUnique({ where: { id: departmentId } }),
      prisma.doctor.findUnique({ where: { id: doctorId }, include: { user: { select: { isActive: true } } } }),
    ]);

    if (!patient || !department || !doctor || !doctor.user.isActive) {
      return NextResponse.json({ error: "Data pasien, poli, atau dokter tidak ditemukan." }, { status: 404 });
    }
    if (doctor.departmentId !== departmentId) {
      return NextResponse.json({ error: "Dokter tidak bertugas di poli yang dipilih." }, { status: 400 });
    }

    // Kunjungan dan antrean dibuat dalam satu transaksi.
    const queue = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          departmentId,
          doctorId,
          appointmentDate: new Date(),
          status: AppointmentStatus.CHECKED_IN,
          notes: notes || "Check-in kunjungan harian",
        },
      });

      return createQueue(tx, appointment.id, department);
    });

    return NextResponse.json({
      success: true,
      queue,
      ticket: {
        queueNumber: queue.queueNumber,
        patientName: patient.fullName,
        medicalRecordNo: patient.medicalRecordNo,
        nik: patient.nik,
        departmentName: department.name,
        doctorName: doctor.fullName,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Kunjungan ini sudah memiliki nomor antrean." }, { status: 409 });
    }
    console.error("POST /api/queues/check-in error:", error);
    return NextResponse.json({ error: "Gagal membuat nomor antrean check-in." }, { status: 500 });
  }
}
