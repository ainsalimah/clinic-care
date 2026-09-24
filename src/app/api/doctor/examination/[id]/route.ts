import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        department: true,
        doctor: true,
        queue: true,
        patient: {
          include: {
            records: {
              take: 5,
              orderBy: { createdAt: "desc" },
              include: {
                doctor: true,
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
            },
          },
        },
        record: {
          include: {
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
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Data janji temu pemeriksaan tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("GET /api/doctor/examination/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat detail pemeriksaan." }, { status: 500 });
  }
}
