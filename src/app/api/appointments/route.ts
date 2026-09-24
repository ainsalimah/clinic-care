import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getClinicDateKey } from "@/lib/clinic-time";

export async function GET() {
  try {
    const today = new Date(`${getClinicDateKey()}T00:00:00.000Z`);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { status: AppointmentStatus.PENDING },
          { status: AppointmentStatus.CONFIRMED, appointmentDate: { gte: today, lt: tomorrow } },
        ],
      },
      include: { patient: true, department: true, doctor: true, schedule: true, queue: true },
      orderBy: [{ appointmentDate: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json({ error: "Gagal memuat pengajuan kunjungan." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { appointmentId, status } = await req.json();
    if (!appointmentId || ![AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED].includes(status)) {
      return NextResponse.json({ error: "Status atau ID kunjungan tidak valid." }, { status: 400 });
    }

    const current = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!current) return NextResponse.json({ error: "Pengajuan kunjungan tidak ditemukan." }, { status: 404 });
    if (current.status !== AppointmentStatus.PENDING) return NextResponse.json({ error: "Hanya pengajuan yang menunggu verifikasi yang dapat diproses." }, { status: 409 });
    if (status === AppointmentStatus.CONFIRMED && current.appointmentDate.toISOString().slice(0, 10) < getClinicDateKey()) {
      return NextResponse.json({ error: "Tanggal kunjungan sudah lewat. Batalkan pengajuan yang kedaluwarsa." }, { status: 409 });
    }

    const appointment = await prisma.appointment.update({ where: { id: appointmentId }, data: { status } });
    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("PATCH /api/appointments error:", error);
    return NextResponse.json({ error: "Pengajuan kunjungan belum berhasil diproses." }, { status: 500 });
  }
}
