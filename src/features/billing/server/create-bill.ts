import { Prisma } from "@prisma/client";
import { billLines } from "@/lib/billing-rules";

export async function createBill(tx: Prisma.TransactionClient, appointmentId: string) {
  const visit = await tx.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true, patient: true, record: { include: { prescription: { include: { items: { include: { medicine: true } } } } } } },
  });
  const snapshot = billLines(visit.doctor.fullName, visit.doctor.consultationFee,
    (visit.record?.prescription?.items ?? []).map(item => ({ ...item.medicine, quantity: item.quantity })));
  return tx.bill.create({ data: {
    appointmentId, patientName: visit.patient.fullName, medicalRecordNo: visit.patient.medicalRecordNo,
    total: snapshot.total, items: { create: snapshot.items },
  } });
}
