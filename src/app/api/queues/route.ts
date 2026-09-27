import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { QueueStatus, AppointmentStatus, Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { getClinicDayRange } from "@/lib/clinic-time";
import { callQueue, QueueCallError } from "@/features/queue/server/call-queue";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sesi login diperlukan." }, { status: 401 });
    const doctor = session.role === "DOCTOR"
      ? await prisma.doctor.findUnique({ where: { userId: session.id }, select: { id: true } })
      : null;
    if (session.role === "DOCTOR" && !doctor) return NextResponse.json({ error: "Profil dokter tidak ditemukan." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    const { start, end } = getClinicDayRange();

    const queues = await prisma.queue.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        departmentId: departmentId || undefined,
        appointment: doctor ? { doctorId: doctor.id } : undefined,
        status: status ? (status as QueueStatus) : undefined,
      },
      include: {
        department: true,
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ queues });
  } catch (error) {
    console.error("GET /api/queues error:", error);
    return NextResponse.json({ error: "Gagal memuat antrean." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi login diperlukan." }, { status: 401 });
    }

    const { queueId, status } = await req.json();

    if (!queueId || !status || !Object.values(QueueStatus).includes(status)) {
      return NextResponse.json({ error: "ID antrean dan status tidak valid." }, { status: 400 });
    }

    const allowedStatuses: QueueStatus[] = session.role === "RECEPTIONIST"
      ? [QueueStatus.CALLED, QueueStatus.SKIPPED]
      : session.role === "DOCTOR"
        ? [QueueStatus.CALLED, QueueStatus.IN_ROOM]
        : [];
    if (!allowedStatuses.includes(status as QueueStatus)) {
      return NextResponse.json({ error: "Role tidak berwenang mengubah antrean ke status tersebut." }, { status: 403 });
    }

    const currentQueue = await prisma.queue.findUnique({ where: { id: queueId } });
    if (!currentQueue) {
      return NextResponse.json({ error: "Antrean tidak ditemukan." }, { status: 404 });
    }
    if (session.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.id }, select: { id: true } });
      const appointment = await prisma.appointment.findUnique({ where: { id: currentQueue.appointmentId }, select: { doctorId: true } });
      if (!doctor || appointment?.doctorId !== doctor.id) {
        return NextResponse.json({ error: "Antrean ini bukan milik dokter yang sedang masuk." }, { status: 403 });
      }
    }
    const canTransitionFromReception = currentQueue.status === QueueStatus.WAITING || currentQueue.status === QueueStatus.CALLED;
    const canTransition = canTransitionFromReception && (
      status === QueueStatus.CALLED ||
      (session.role === "RECEPTIONIST" && status === QueueStatus.SKIPPED) ||
      (session.role === "DOCTOR" && status === QueueStatus.IN_ROOM)
    );
    if (!canTransition) {
      return NextResponse.json({ error: "Perubahan status antrean tidak valid." }, { status: 400 });
    }

    if (status === QueueStatus.CALLED) {
      const called = await prisma.$transaction(
        (tx) => callQueue(tx, queueId),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return NextResponse.json({ success: true, queue: called });
    }
    if (status === QueueStatus.IN_ROOM) {
      const queue = await prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.findUniqueOrThrow({ where: { id: currentQueue.appointmentId }, select: { doctorId: true } });
        // Serialize room admission per doctor, independent from whether another queue row exists yet.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`doctor-room:${appointment.doctorId}`}))`;
        const { start, end } = getClinicDayRange();
        const otherPatient = await tx.queue.findFirst({
          where: { id: { not: queueId }, createdAt: { gte: start, lt: end }, appointment: { doctorId: appointment.doctorId }, status: QueueStatus.IN_ROOM },
          select: { id: true },
        });
        if (otherPatient) throw new QueueCallError("Selesaikan pasien yang sedang diperiksa sebelum membuka pasien lain.", 409);
        const changed = await tx.queue.updateMany({ where: { id: queueId, status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] } }, data: { status, calledAt: new Date() } });
        if (changed.count !== 1) throw new QueueCallError("Antrean sudah diperbarui petugas lain.", 409);
        await tx.appointment.update({ where: { id: currentQueue.appointmentId }, data: { status: AppointmentStatus.IN_EXAMINATION } });
        return tx.queue.findUniqueOrThrow({ where: { id: queueId }, include: { appointment: true } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return NextResponse.json({ success: true, queue });
    }

    const updateData: {
      status: QueueStatus;
      calledAt?: Date;
      completedAt?: Date;
    } = { status };

    if (status === QueueStatus.CALLED || status === QueueStatus.IN_ROOM) {
      updateData.calledAt = new Date();
    } else if (status === QueueStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const queue = await prisma.$transaction(async (tx) => {
      const changed = await tx.queue.updateMany({ where: { id: queueId, status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] } }, data: updateData });
      if (changed.count !== 1) throw new QueueCallError("Antrean sudah diperbarui petugas lain.", 409);
      if (status === QueueStatus.SKIPPED) await tx.appointment.update({ where: { id: currentQueue.appointmentId }, data: { status: AppointmentStatus.NO_SHOW } });
      return tx.queue.findUniqueOrThrow({ where: { id: queueId }, include: { appointment: true } });
    });

    return NextResponse.json({ success: true, queue });
  } catch (error) {
    if (error instanceof QueueCallError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return NextResponse.json({ error: "Antrean sedang diperbarui. Coba panggil ulang." }, { status: 409 });
    }
    console.error("PATCH /api/queues error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status antrean." }, { status: 500 });
  }
}
