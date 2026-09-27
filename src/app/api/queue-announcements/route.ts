import { NextResponse } from "next/server";
import { Prisma, QueueStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getClinicDayRange } from "@/lib/clinic-time";
import { callQueue } from "@/features/queue/server/call-queue";

async function allowed() {
  const session = await getSession();
  return session?.role === "RECEPTIONIST" || session?.role === "ADMIN";
}

async function dispatchDueCalls() {
  const now = new Date();
  const { start, end } = getClinicDayRange(now);
  const due = await prisma.queueAutoCall.findMany({
    where: { dueAt: { lte: now }, processedAt: null, cancelledAt: null },
    orderBy: [{ dueAt: "asc" }, { id: "asc" }],
    take: 20,
    select: { id: true, doctorId: true },
  });

  for (const request of due) {
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.queueAutoCall.updateMany({
          where: { id: request.id, processedAt: null, cancelledAt: null },
          data: { processedAt: now },
        });
        if (claimed.count !== 1) return;

        const active = await tx.queue.findFirst({
          where: {
            createdAt: { gte: start, lt: end },
            appointment: { doctorId: request.doctorId },
            status: { in: [QueueStatus.CALLED, QueueStatus.IN_ROOM] },
          },
          select: { id: true },
        });
        if (active) return;

        const next = await tx.queue.findFirst({
          where: {
            createdAt: { gte: start, lt: end },
            appointment: { doctorId: request.doctorId },
            status: QueueStatus.WAITING,
          },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
          select: { id: true },
        });
        if (!next) return;

        await callQueue(tx, next.id);
        await tx.queueAutoCall.update({ where: { id: request.id }, data: { calledQueueId: next.id } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      // A serialization conflict or a simultaneous manual call will be retried on the next poll.
      console.error("Dispatch panggilan antrean tertunda:", error);
    }
  }
}

export async function GET() {
  if (!(await allowed())) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  const { start, end } = getClinicDayRange();
  const announcements = await prisma.queueAnnouncement.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 8,
    select: { id: true, queueNumber: true, roomLabel: true, createdAt: true, playedAt: true },
  });
  return NextResponse.json({ announcements });
}

export async function POST() {
  if (!(await allowed())) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  await dispatchDueCalls();
  const { start, end } = getClinicDayRange();

  for (let attempt = 0; attempt < 3; attempt++) {
    const now = new Date();
    const candidate = await prisma.queueAnnouncement.findFirst({
      where: {
        playedAt: null,
        createdAt: { gte: start, lt: end },
        OR: [{ claimedUntil: null }, { claimedUntil: { lte: now } }],
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    if (!candidate) return NextResponse.json({ announcement: null });
    const queue = await prisma.queue.findUnique({ where: { id: candidate.queueId }, select: { status: true } });
    if (queue?.status !== QueueStatus.CALLED) {
      await prisma.queueAnnouncement.updateMany({ where: { id: candidate.id, playedAt: null }, data: { playedAt: now } });
      continue;
    }

    const claimToken = crypto.randomUUID();
    const claimed = await prisma.queueAnnouncement.updateMany({
      where: {
        id: candidate.id,
        playedAt: null,
        OR: [{ claimedUntil: null }, { claimedUntil: { lte: now } }],
      },
      data: { claimToken, claimedUntil: new Date(now.getTime() + 60_000) },
    });
    if (claimed.count === 1) {
      return NextResponse.json({
        announcement: {
          id: candidate.id,
          queueNumber: candidate.queueNumber,
          roomLabel: candidate.roomLabel,
          claimToken,
        },
      });
    }
  }
  return NextResponse.json({ announcement: null });
}

export async function PATCH(req: Request) {
  if (!(await allowed())) return NextResponse.json({ error: "Akses petugas diperlukan." }, { status: 403 });
  const { id, claimToken } = await req.json();
  if (typeof id !== "string" || typeof claimToken !== "string") {
    return NextResponse.json({ error: "Panggilan tidak valid." }, { status: 400 });
  }
  const played = await prisma.queueAnnouncement.updateMany({
    where: { id, claimToken, playedAt: null },
    data: { playedAt: new Date(), claimToken: null, claimedUntil: null },
  });
  if (played.count !== 1) return NextResponse.json({ error: "Panggilan sudah diambil perangkat lain." }, { status: 409 });
  return NextResponse.json({ success: true });
}
