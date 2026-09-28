import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClinicDateKey } from "@/lib/clinic-time";
import { getSession } from "@/lib/auth";
import { reportRange } from "@/lib/payment-report";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === "PATIENT") return NextResponse.json({ error: "Akses staf diperlukan." }, { status: 403 });

    const params = new URL(req.url).searchParams;
    const from = params.get("from") ?? getClinicDateKey();
    const to = params.get("to") ?? from;
    const { start, end } = reportRange(from, to);
    const range = { gte: start, lt: end };

    // 1. Master counts and registrations in the selected period.
    const [totalPatients, registeredPatientsCount] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: range } }),
    ]);
    const totalDoctors = await prisma.doctor.count();
    const totalDepartments = await prisma.department.count();
    const totalMedicines = await prisma.medicine.count();

    // 2. Elderly patients registered during the selected period.
    const sixtyYearsAgo = new Date();
    sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);
    const elderlyPatientsCount = await prisma.patient.count({
      where: {
        createdAt: range,
        dateOfBirth: { lte: sixtyYearsAgo },
      },
    });

    // 3. Queues & visits in the selected period.
    const allQueues = await prisma.queue.findMany({
      where: { createdAt: range },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
        department: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const activeQueuesCount = allQueues.filter(
      (q) => q.status === "WAITING" || q.status === "CALLED" || q.status === "IN_ROOM"
    ).length;
    const completedQueuesCount = allQueues.filter((q) => q.status === "COMPLETED").length;
    const visitsByDepartment = allQueues.reduce<Record<string, number>>((counts, queue) => {
      counts[queue.departmentId] = (counts[queue.departmentId] ?? 0) + 1;
      return counts;
    }, {});

    // 4. Prescriptions completed or still pending within the selected period.
    const pendingPrescriptionsCount = await prisma.prescription.count({
      where: {
        createdAt: range,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });
    const completedPrescriptionsCount = await prisma.prescription.count({
      where: { dispensedAt: range, status: "COMPLETED" },
    });

    // 5. Reconstruct the stock balance at the end of the selected period.
    // Current stock is reversed by every mutation recorded after the report cutoff.
    const allMedicines = await prisma.medicine.findMany({
      orderBy: { stock: "asc" },
    });
    const transactionsAfterPeriod = await prisma.inventoryTransaction.findMany({
      where: { createdAt: { gte: end } },
      select: { medicineId: true, type: true, quantity: true },
    });
    const stockChangeAfterPeriod = transactionsAfterPeriod.reduce<Record<string, number>>((balances, transaction) => {
      const direction = transaction.type === "OUT" ? -1 : 1;
      balances[transaction.medicineId] = (balances[transaction.medicineId] ?? 0) + direction * transaction.quantity;
      return balances;
    }, {});
    const medicinesAtPeriodEnd = allMedicines.map(medicine => ({ ...medicine, periodStock: medicine.stock - (stockChangeAfterPeriod[medicine.id] ?? 0) }));
    const lowStockMedicines = medicinesAtPeriodEnd.filter((m) => m.periodStock <= m.minimumStock);
    const outOfStockCount = medicinesAtPeriodEnd.filter((m) => m.periodStock <= 0).length;

    // 6. Department breakdown
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            appointments: true,
            doctors: true,
          },
        },
      },
    });

    // 7. Inventory mutations in the selected period.
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      where: { createdAt: range },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        medicine: true,
      },
    });

    // 8. Medical record count remains a master-data reference.
    const totalMedicalRecords = await prisma.medicalRecord.count();

    return NextResponse.json({
      summary: {
        totalPatients,
        registeredPatientsCount,
        elderlyPatientsCount,
        totalDoctors,
        totalDepartments,
        totalMedicines,
        totalMedicalRecords,
        visitsCount: allQueues.length,
        activeQueuesCount,
        completedQueuesCount,
        pendingPrescriptionsCount,
        completedPrescriptionsCount,
        lowStockCount: lowStockMedicines.length,
        outOfStockCount,
      },
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        doctorCount: d._count.doctors,
        visitCount: visitsByDepartment[d.id] ?? 0,
      })),
      lowStockList: lowStockMedicines.slice(0, 6).map((m) => ({
        id: m.id,
        name: m.name,
        form: m.form,
        stock: m.periodStock,
        minimumStock: m.minimumStock,
        unit: m.unit,
      })),
      recentQueues: allQueues.slice(0, 8).map((q) => ({
        id: q.id,
        queueNumber: q.queueNumber,
        status: q.status,
        patientName: q.appointment.patient.fullName,
        medicalRecordNo: q.appointment.patient.medicalRecordNo,
        departmentName: q.department.name,
        doctorName: q.appointment.doctor.user.name,
        time: new Date(q.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }),
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        medicineName: tx.medicine.name,
        type: tx.type,
        quantity: tx.quantity,
        unit: tx.medicine.unit,
        notes: tx.notes,
        createdAt: tx.createdAt,
      })),
      period: { from, to },
    });
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data laporan operasional." },
      { status: 500 }
    );
  }
}
