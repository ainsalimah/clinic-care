import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClinicDayRange } from "@/lib/clinic-time";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role === "PATIENT") return NextResponse.json({ error: "Akses staf diperlukan." }, { status: 403 });

    // 1. Total counts
    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();
    const totalDepartments = await prisma.department.count();
    const totalMedicines = await prisma.medicine.count();

    // 2. Elderly patient count (born on or before 60 years ago)
    const sixtyYearsAgo = new Date();
    sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);
    const elderlyPatientsCount = await prisma.patient.count({
      where: {
        dateOfBirth: {
          lte: sixtyYearsAgo,
        },
      },
    });

    // 3. Today's start & end
    const { start, end } = getClinicDayRange();

    // 4. Queues & Visits
    const allQueues = await prisma.queue.findMany({
      where: { createdAt: { gte: start, lt: end } },
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

    // 5. Prescriptions
    const pendingPrescriptionsCount = await prisma.prescription.count({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });
    const completedPrescriptionsCount = await prisma.prescription.count({
      where: { status: "COMPLETED" },
    });

    // 6. Medicines Stock Status
    const allMedicines = await prisma.medicine.findMany({
      orderBy: { stock: "asc" },
    });
    const lowStockMedicines = allMedicines.filter((m) => m.stock <= m.minimumStock);
    const outOfStockCount = allMedicines.filter((m) => m.stock === 0).length;

    // 7. Department breakdown
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

    // 8. Recent Inventory Transactions (Dispensed / Restocked)
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        medicine: true,
      },
    });

    // 9. Recent Medical Records
    const totalMedicalRecords = await prisma.medicalRecord.count();

    return NextResponse.json({
      summary: {
        totalPatients,
        elderlyPatientsCount,
        totalDoctors,
        totalDepartments,
        totalMedicines,
        totalMedicalRecords,
        todayVisitsCount: allQueues.length,
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
        visitCount: d._count.appointments,
      })),
      lowStockList: lowStockMedicines.slice(0, 6).map((m) => ({
        id: m.id,
        name: m.name,
        form: m.form,
        stock: m.stock,
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
    });
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data laporan operasional." },
      { status: 500 }
    );
  }
}
