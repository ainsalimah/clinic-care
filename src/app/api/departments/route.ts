import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        doctors: {
          include: {
            schedules: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("GET /api/departments error:", error);
    return NextResponse.json({ error: "Gagal memuat data departemen/poli." }, { status: 500 });
  }
}
