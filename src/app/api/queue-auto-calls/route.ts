import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getDoctorId(userId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } });
  return doctor?.id;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") return NextResponse.json({ error: "Akses dokter diperlukan." }, { status: 403 });
  const doctorId = await getDoctorId(session.id);
  const appointmentId = new URL(req.url).searchParams.get("appointmentId");
  if (!doctorId || !appointmentId) return NextResponse.json({ error: "Kunjungan tidak valid." }, { status: 400 });
  const autoCall = await prisma.queueAutoCall.findUnique({ where: { sourceAppointmentId: appointmentId } });
  if (!autoCall || autoCall.doctorId !== doctorId) return NextResponse.json({ error: "Panggilan otomatis tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ autoCall });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") return NextResponse.json({ error: "Akses dokter diperlukan." }, { status: 403 });
  const doctorId = await getDoctorId(session.id);
  const { id } = await req.json();
  if (!doctorId || typeof id !== "string") return NextResponse.json({ error: "Panggilan tidak valid." }, { status: 400 });
  const now = new Date();
  const cancelled = await prisma.queueAutoCall.updateMany({
    where: { id, doctorId, processedAt: null, cancelledAt: null, dueAt: { gt: now } },
    data: { cancelledAt: now },
  });
  if (cancelled.count !== 1) return NextResponse.json({ error: "Panggilan sudah diproses atau tidak dapat dibatalkan." }, { status: 409 });
  return NextResponse.json({ success: true });
}
