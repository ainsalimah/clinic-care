import { Prisma, QueueStatus } from "@prisma/client";
import { getClinicDayRange } from "@/lib/clinic-time";

type QueueTransaction = Prisma.TransactionClient;

export class QueueCallError extends Error {
  constructor(message: string, public status = 409) {
    super(message);
  }
}

/** The same transition creates the audio event for manual calls and automatic calls. */
export async function callQueue(tx: QueueTransaction, queueId: string, options?: { playedLocally?: boolean }) {
  const queue = await tx.queue.findUnique({
    where: { id: queueId },
    include: { appointment: { include: { doctor: true } } },
  });
  if (!queue) throw new QueueCallError("Antrean tidak ditemukan.", 404);
  if (queue.status !== QueueStatus.WAITING && queue.status !== QueueStatus.CALLED) {
    throw new QueueCallError("Antrean ini tidak dapat dipanggil.");
  }

  const { start, end } = getClinicDayRange();
  if (queue.createdAt < start || queue.createdAt >= end) {
    throw new QueueCallError("Hanya antrean hari ini yang dapat dipanggil.");
  }

  if (queue.status === QueueStatus.WAITING) {
    const active = await tx.queue.findFirst({
      where: {
        id: { not: queueId },
        createdAt: { gte: start, lt: end },
        appointment: { doctorId: queue.appointment.doctorId },
        status: { in: [QueueStatus.CALLED, QueueStatus.IN_ROOM] },
      },
      select: { id: true },
    });
    if (active) throw new QueueCallError("Dokter ini masih memiliki pasien yang dipanggil atau sedang diperiksa.");
  }

  const now = new Date();
  const updated = await tx.queue.updateMany({
    where: { id: queueId, status: queue.status },
    data: { status: QueueStatus.CALLED, calledAt: now },
  });
  if (updated.count !== 1) throw new QueueCallError("Status antrean sudah berubah. Muat ulang daftar antrean.");

  // A new recall replaces an announcement that has not played yet.
  await tx.queueAnnouncement.updateMany({
    where: { queueId, playedAt: null, claimedUntil: null },
    data: { playedAt: now },
  });

  const announcement = await tx.queueAnnouncement.create({
    data: {
      queueId,
      doctorId: queue.appointment.doctorId,
      queueNumber: queue.queueNumber,
      roomLabel: queue.appointment.doctor.roomLabel?.trim() || `Ruang praktik ${queue.appointment.doctor.fullName}`,
      playedAt: options?.playedLocally ? now : null,
    },
  });

  return { id: queueId, queueNumber: queue.queueNumber, roomLabel: announcement.roomLabel, calledAt: now };
}
