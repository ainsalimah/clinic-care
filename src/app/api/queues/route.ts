import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { QueueStatus, AppointmentStatus } from "@prisma/client";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    // Tanggal hari ini (mulai 00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const queues = await prisma.queue.findMany({
      where: {
        createdAt: { gte: startOfDay },
        departmentId: departmentId || undefined,
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
    const canTransitionFromReception = currentQueue.status === QueueStatus.WAITING || currentQueue.status === QueueStatus.CALLED;
    const canTransition = canTransitionFromReception && (
      status === QueueStatus.CALLED ||
      (session.role === "RECEPTIONIST" && status === QueueStatus.SKIPPED) ||
      (session.role === "DOCTOR" && status === QueueStatus.IN_ROOM)
    );
    if (!canTransition) {
      return NextResponse.json({ error: "Perubahan status antrean tidak valid." }, { status: 400 });
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

    const queue = await prisma.queue.update({
      where: { id: queueId },
      data: updateData,
      include: {
        appointment: true,
      },
    });

    // Sinkronkan status appointment jika relevan
    if (status === QueueStatus.IN_ROOM) {
      await prisma.appointment.update({
        where: { id: queue.appointmentId },
        data: { status: AppointmentStatus.IN_EXAMINATION },
      });
    } else if (status === QueueStatus.COMPLETED) {
      await prisma.appointment.update({
        where: { id: queue.appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });
    } else if (status === QueueStatus.SKIPPED) {
      await prisma.appointment.update({
        where: { id: queue.appointmentId },
        data: { status: AppointmentStatus.NO_SHOW },
      });
    }

    return NextResponse.json({ success: true, queue });
  } catch (error) {
    console.error("PATCH /api/queues error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status antrean." }, { status: 500 });
  }
}
