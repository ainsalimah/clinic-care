import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const patientId = searchParams.get("patientId");

    const records = await prisma.medicalRecord.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          query
            ? {
                OR: [
                  { diagnosis: { contains: query, mode: "insensitive" } },
                  { complaint: { contains: query, mode: "insensitive" } },
                  { treatment: { contains: query, mode: "insensitive" } },
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
        prescription: {
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET /api/records error:", error);
    return NextResponse.json({ error: "Gagal memuat rekam medis." }, { status: 500 });
  }
}
