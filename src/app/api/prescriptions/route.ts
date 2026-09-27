import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrescriptionStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim() || "";

    const prescriptions = await prisma.prescription.findMany({
      where: {
        AND: [
          status && status !== "ALL"
            ? { status: status as PrescriptionStatus }
            : {},
          query
            ? {
                OR: [
                  { patient: { fullName: { contains: query, mode: "insensitive" } } },
                  { patient: { medicalRecordNo: { contains: query, mode: "insensitive" } } },
                  { doctor: { fullName: { contains: query, mode: "insensitive" } } },
                ],
              }
            : {},
        ],
      },
      include: {
        patient: true,
        doctor: {
          include: { department: true },
        },
        medicalRecord: { include: { appointment: { select: { bill: { select: { total: true, paidAt: true } } } } } },
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("GET /api/prescriptions error:", error);
    return NextResponse.json({ error: "Gagal memuat resep farmasi." }, { status: 500 });
  }
}
