import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        doctors: {
          where: { user: { isActive: true } },
          select: {
            id: true,
            fullName: true,
            specialization: true,
            consultationFee: true,
            licenseNumber: true,
            roomLabel: true,
            schedules: {
              select: { id: true, dayOfWeek: true, startTime: true, endTime: true, quota: true },
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
          },
          orderBy: { fullName: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("GET /api/public/catalog error:", error);
    return NextResponse.json({ error: "Informasi layanan belum dapat dimuat." }, { status: 500 });
  }
}
