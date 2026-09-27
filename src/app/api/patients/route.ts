import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createMedicalRecordNumber } from "@/features/patients/server/medical-record-number";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const patients = await prisma.patient.findMany({
      where: query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { nik: { contains: query } },
              { medicalRecordNo: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : undefined,
      select: {
        id: true,
        medicalRecordNo: true,
        nik: true,
        fullName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        phone: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json({ error: "Gagal memuat data pasien." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.role === "PATIENT" ? session.id : null;

    const body = await req.json();
    const {
      fullName,
      nik,
      dateOfBirth,
      gender,
      address,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
    } = body;

    const normalizedNik = typeof nik === "string" ? nik.trim() : "";
    const normalizedName = typeof fullName === "string" ? fullName.trim() : "";
    const normalizedDob = dateOfBirth ? new Date(dateOfBirth) : null;

    if (!normalizedName || !normalizedDob || Number.isNaN(normalizedDob.getTime()) || !["MALE", "FEMALE", "UNKNOWN"].includes(gender)) {
      return NextResponse.json(
        { error: "Nama lengkap, tanggal lahir, dan jenis kelamin wajib diisi." },
        { status: 400 }
      );
    }
    if (normalizedNik && !/^\d{16}$/.test(normalizedNik)) {
      return NextResponse.json({ error: "NIK harus terdiri dari 16 digit." }, { status: 400 });
    }
    if (Boolean(emergencyContactName) !== Boolean(emergencyContactPhone)) {
      return NextResponse.json({ error: "Lengkapi nama dan telepon kontak pendamping, atau kosongkan keduanya." }, { status: 400 });
    }

    // Cek duplikasi NIK jika diisi
    if (normalizedNik) {
      const existing = await prisma.patient.findUnique({ where: { nik: normalizedNik } });
      if (existing) {
        return NextResponse.json(
          { error: `Pasien dengan NIK ${nik} sudah terdaftar (${existing.fullName}).` },
          { status: 409 }
        );
      }
    }

    const medicalRecordNo = createMedicalRecordNumber();

    const newPatient = await prisma.patient.create({
      data: {
        userId: userId || null,
        medicalRecordNo,
        nik: normalizedNik || null,
        fullName: normalizedName,
        dateOfBirth: normalizedDob,
        gender: gender || "MALE",
        address: address || null,
        phone: phone || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        allergies: allergies || null,
      },
    });

    return NextResponse.json({ success: true, patient: newPatient }, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json({ error: "Gagal mendaftarkan pasien baru." }, { status: 500 });
  }
}
