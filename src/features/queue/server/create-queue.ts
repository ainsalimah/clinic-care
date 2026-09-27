import { Prisma, QueueStatus } from "@prisma/client";
import { getClinicDateKey, getClinicDayRange } from "@/lib/clinic-time";

const departmentPrefixes: Record<string, string> = {
  "Poli Umum": "A",
  "Poli Anak": "B",
  "Poli Gigi": "C",
  "Poli Penyakit Dalam": "D",
};

/** Call inside the appointment transaction so both records commit together. */
export async function createQueue(
  tx: Prisma.TransactionClient,
  appointmentId: string,
  department: { id: string; name: string },
  now = new Date(),
) {
  const dateKey = getClinicDateKey(now);
  // All check-ins for a department and clinic day use the same PostgreSQL lock.
  // The count must happen after acquiring it to prevent duplicate ticket numbers.
  await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtext(${`${department.id}:${dateKey}`}))`;

  const { start, end } = getClinicDayRange(now);
  const count = await tx.queue.count({
    where: { departmentId: department.id, createdAt: { gte: start, lt: end } },
  });
  const prefix = departmentPrefixes[department.name] ?? department.name.charAt(0).toUpperCase() ?? "Q";
  const queueNumber = `${prefix || "Q"}-${String(count + 1).padStart(3, "0")}`;

  return tx.queue.create({
    data: { appointmentId, departmentId: department.id, queueNumber, status: QueueStatus.WAITING, createdAt: now },
    include: { department: true, appointment: { include: { patient: true, doctor: true } } },
  });
}
