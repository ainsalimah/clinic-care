import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "DOCTOR") return NextResponse.json({ error: "Akses dokter diperlukan." }, { status: 403 });
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
    const doctor = await prisma.doctor.findUnique({ where: { userId: session.id }, select: { id: true } });
    if (!doctor || appointment.doctorId !== doctor.id) {
      return NextResponse.json({ error: "Kunjungan ini bukan milik dokter yang sedang masuk." }, { status: 403 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("GET /api/doctor/examination/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat detail pemeriksaan." }, { status: 500 });
  }
}
