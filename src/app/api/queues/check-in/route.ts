import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentStatus, QueueStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { getClinicDateKey } from "@/lib/clinic-time";

const deptPrefixes: Record<string, string> = {
  "Poli Umum": "A",
  "Poli Anak": "B",
  "Poli Gigi": "C",
  "Poli Penyakit Dalam": "D",
};

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

      const startOfDay = new Date(`${todayKey}T00:00:00.000Z`);
      startOfDay.setUTCHours(startOfDay.getUTCHours() - 7);
      const queueNumberCount = await prisma.queue.count({ where: { departmentId: appointment.departmentId, createdAt: { gte: startOfDay } } });
      const prefix = deptPrefixes[appointment.department.name] || appointment.department.name.charAt(0).toUpperCase() || "Q";
      const queueNumber = `${prefix}-${String(queueNumberCount + 1).padStart(3, "0")}`;
      const queue = await prisma.$transaction(async (tx) => {
        const created = await tx.queue.create({
          data: { appointmentId: appointment.id, departmentId: appointment.departmentId, queueNumber, status: QueueStatus.WAITING },
          include: { department: true, appointment: { include: { patient: true, doctor: true } } },
        });
        await tx.appointment.update({ where: { id: appointment.id }, data: { status: AppointmentStatus.CHECKED_IN } });
        return created;
      });

      return NextResponse.json({
        success: true,
        queue,
        ticket: {
          queueNumber,
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
      prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);

    if (!patient || !department || !doctor) {
      return NextResponse.json({ error: "Data pasien, poli, atau dokter tidak ditemukan." }, { status: 404 });
    }
    if (doctor.departmentId !== departmentId) {
      return NextResponse.json({ error: "Dokter tidak bertugas di poli yang dipilih." }, { status: 400 });
    }

    // Tanggal hari ini
    const startOfDay = new Date(`${getClinicDateKey()}T00:00:00.000Z`);
    startOfDay.setUTCHours(startOfDay.getUTCHours() - 7);

    // Hitung antrean yang sudah ada di poli ini hari ini
    const existingQueueCount = await prisma.queue.count({
      where: {
        departmentId,
        createdAt: { gte: startOfDay },
      },
    });

    const prefix = deptPrefixes[department.name] || department.name.charAt(0).toUpperCase() || "Q";
    const queueNumber = `${prefix}-${String(existingQueueCount + 1).padStart(3, "0")}`;

    // Buat Appointment baru dengan status CHECKED_IN
    // Kunjungan dan antrean harus berhasil atau gagal bersama.
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

      return tx.queue.create({
        data: {
          appointmentId: appointment.id,
          departmentId,
          queueNumber,
          status: QueueStatus.WAITING,
        },
        include: {
          department: true,
          appointment: { include: { patient: true, doctor: true } },
        },
      });
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
    console.error("POST /api/queues/check-in error:", error);
    return NextResponse.json({ error: "Gagal membuat nomor antrean check-in." }, { status: 500 });
  }
}
