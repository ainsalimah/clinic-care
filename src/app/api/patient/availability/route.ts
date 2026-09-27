import { NextResponse } from "next/server";
import { AppointmentStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getClinicDateKey } from "@/lib/clinic-time";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") return NextResponse.json({ error: "Akses pasien diperlukan." }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const departmentId = searchParams.get("departmentId");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !departmentId) {
    return NextResponse.json({ error: "Tanggal dan poli wajib dipilih." }, { status: 400 });
  }
  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date || date < getClinicDateKey()) {
    return NextResponse.json({ error: "Tanggal kunjungan tidak valid." }, { status: 400 });
  }
  const end = new Date(start.getTime() + 86_400_000);
  const schedules = await prisma.schedule.findMany({
    where: { departmentId, dayOfWeek: start.getUTCDay(), doctor: { user: { isActive: true } } },
    include: { doctor: { select: { id: true, fullName: true, roomLabel: true } } },
    orderBy: [{ startTime: "asc" }, { doctor: { fullName: "asc" } }],
  });
  const counts = schedules.length ? await prisma.appointment.groupBy({
    by: ["scheduleId"],
    where: {
      scheduleId: { in: schedules.map((schedule) => schedule.id) },
      appointmentDate: { gte: start, lt: end },
      status: { not: AppointmentStatus.CANCELLED },
    },
    _count: { _all: true },
  }) : [];
  const booked = new Map(counts.map((item) => [item.scheduleId, item._count._all]));
  const now = new Date();
  return NextResponse.json({ schedules: schedules.map((schedule) => {
    const visitStart = new Date(`${date}T${schedule.startTime}:00.000+07:00`);
    return {
      id: schedule.id,
      doctorId: schedule.doctor.id,
      doctorName: schedule.doctor.fullName,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      quota: schedule.quota,
      remaining: Math.max(0, schedule.quota - (booked.get(schedule.id) ?? 0)),
      hasPassed: visitStart <= now,
    };
  }) });
}
