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
          select: {
            id: true,
            fullName: true,
            specialization: true,
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

    const defaultDoctors: Record<string, any[]> = {
      "Poli Gigi": [
        {
          id: "doc-gigi-fadhil",
          fullName: "drg. Fadhil Ramadhan",
          specialization: "Dokter Gigi & Mulut",
          schedules: [1, 2, 3, 4, 5].map((day) => ({
            id: `sch-gigi-${day}`,
            dayOfWeek: day,
            startTime: "13:00",
            endTime: "17:00",
            quota: 15,
          })),
        },
      ],
      "Poli Penyakit Dalam": [
        {
          id: "doc-dalam-bambang",
          fullName: "dr. Bambang Setiawan, Sp.PD",
          specialization: "Spesialis Penyakit Dalam",
          schedules: [1, 2, 3, 4, 5].map((day) => ({
            id: `sch-dalam-${day}`,
            dayOfWeek: day,
            startTime: "14:00",
            endTime: "18:00",
            quota: 15,
          })),
        },
      ],
    };

    const enrichedDepartments = departments.map((dept) => {
      if (dept.doctors.length === 0 && defaultDoctors[dept.name]) {
        return {
          ...dept,
          doctors: defaultDoctors[dept.name],
        };
      }
      return dept;
    });

    return NextResponse.json({ departments: enrichedDepartments });
  } catch (error) {
    console.error("GET /api/public/catalog error:", error);
    return NextResponse.json({ error: "Informasi layanan belum dapat dimuat." }, { status: 500 });
  }
}
