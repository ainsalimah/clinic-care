import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT") return NextResponse.json({ error: "Akses pasien diperlukan." }, { status: 403 });

    const patient = await prisma.patient.findUnique({
      where: { userId: session.id },
      select: {
        id: true,
        fullName: true,
        medicalRecordNo: true,
        appointments: {
          include: { department: true, doctor: true, schedule: true, queue: true },
          orderBy: { appointmentDate: "desc" },
          take: 20,
        },
      },
    });
    if (!patient) return NextResponse.json({ error: "Profil pasien belum terhubung." }, { status: 404 });
    return NextResponse.json({ patient });
  } catch (error) {
    console.error("GET /api/patient/appointments error:", error);
    return NextResponse.json({ error: "Gagal memuat jadwal kunjungan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PATIENT") return NextResponse.json({ error: "Akses pasien diperlukan." }, { status: 403 });

    const { scheduleId, appointmentDate, notes } = await req.json();
    if (typeof scheduleId !== "string" || typeof appointmentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return NextResponse.json({ error: "Pilih dokter, poli, dan tanggal kunjungan yang valid." }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { userId: session.id }, select: { id: true } });
    if (!patient) return NextResponse.json({ error: "Profil pasien belum terhubung." }, { status: 404 });

    const dayStart = new Date(`${appointmentDate}T00:00:00.000Z`);
    if (Number.isNaN(dayStart.getTime()) || dayStart.toISOString().slice(0, 10) !== appointmentDate) return NextResponse.json({ error: "Tanggal kunjungan tidak valid." }, { status: 400 });
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { doctor: true, department: true },
    });
    if (!schedule || dayStart.getUTCDay() !== schedule.dayOfWeek) {
      return NextResponse.json({ error: "Jadwal dokter tidak tersedia pada tanggal tersebut." }, { status: 400 });
    }

    // Jadwal klinik ditampilkan dalam WIB (UTC+7); convert jam praktik ke UTC untuk perbandingan server.
    const visitStart = new Date(`${appointmentDate}T${schedule.startTime}:00.000Z`);
    visitStart.setUTCHours(visitStart.getUTCHours() - 7);
    if (visitStart <= new Date()) return NextResponse.json({ error: "Pilih jadwal yang belum terlewat." }, { status: 400 });

    const existing = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        appointmentDate: { gte: dayStart, lt: dayEnd },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });
    if (existing) return NextResponse.json({ error: "Anda sudah memiliki kunjungan aktif pada tanggal tersebut." }, { status: 409 });

    const bookedCount = await prisma.appointment.count({
      where: {
        scheduleId,
        appointmentDate: { gte: dayStart, lt: dayEnd },
        status: { not: AppointmentStatus.CANCELLED },
      },
    });
    if (bookedCount >= schedule.quota) return NextResponse.json({ error: "Kuota jadwal ini sudah penuh. Silakan pilih jadwal lain." }, { status: 409 });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        departmentId: schedule.departmentId,
        doctorId: schedule.doctorId,
        scheduleId: schedule.id,
        appointmentDate: dayStart,
        status: AppointmentStatus.PENDING,
        notes: typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 500) : null,
      },
      include: { department: true, doctor: true, schedule: true },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/patient/appointments error:", error);
    return NextResponse.json({ error: "Pengajuan kunjungan belum berhasil." }, { status: 500 });
  }
}
