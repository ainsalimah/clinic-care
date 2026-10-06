import { NextResponse } from "next/server";
import { Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { getClinicDateKey } from "@/lib/clinic-time";
import { createMedicalRecordNumber } from "@/features/patients/server/medical-record-number";
import { limitAuthRequest } from "@/lib/rate-limit";
import { getSessionSecret } from "@/lib/session-config";

export async function POST(req: Request) {
  try {
    getSessionSecret();
    const body = await req.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const nik = typeof body.nik === "string" ? body.nik.replace(/\D/g, "") : "";
    const dateOfBirth = typeof body.dateOfBirth === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dateOfBirth) ? new Date(`${body.dateOfBirth}T00:00:00.000Z`) : null;
    const gender = body.gender;
    const password = typeof body.password === "string" ? body.password : "";

    if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !phone || !/^\d{8,15}$/.test(phone.replace(/\D/g, "")) || !/^\d{16}$/.test(nik) || !dateOfBirth || Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.toISOString().slice(0, 10) !== body.dateOfBirth || body.dateOfBirth >= getClinicDateKey() || !["MALE", "FEMALE", "UNKNOWN"].includes(gender)) {
      return NextResponse.json({ error: "Lengkapi nama, email, kata sandi minimal 8 karakter, telepon, NIK 16 digit, tanggal lahir, dan jenis kelamin dengan benar." }, { status: 400 });
    }

    if (fullName.length > 120 || email.length > 254 || Buffer.byteLength(password) > 72) {
      return NextResponse.json({ error: "Nama, email, atau kata sandi terlalu panjang." }, { status: 400 });
    }
    const limited = await limitAuthRequest(req, "register", email);
    if (limited) return limited;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const existingEmail = await tx.user.findUnique({ where: { email } });
      if (existingEmail) return { error: "Email sudah digunakan. Silakan masuk atau gunakan email lain." };

      const existingPatient = await tx.patient.findUnique({ where: { nik } });
      if (existingPatient) {
        return { error: "NIK sudah terdaftar. Jika sudah memiliki akun, silakan masuk. Pengaitan akun ke pasien lama belum tersedia pada demo ini; gunakan akun pasien demo untuk mencoba portal." };
      }

      const user = await tx.user.create({
        data: { name: fullName, email, passwordHash, role: Role.PATIENT },
      });

      const patient = await tx.patient.create({
            data: {
              userId: user.id,
              medicalRecordNo: createMedicalRecordNumber(),
              nik,
              fullName,
              dateOfBirth,
              gender,
              phone: phone.replace(/\D/g, ""),
            },
          });

      return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, patient };
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });

    await setSession(result.user);
    return NextResponse.json({ success: true, user: result.user, patient: { id: result.patient.id, medicalRecordNo: result.patient.medicalRecordNo } }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Data sudah terdaftar. Silakan masuk atau hubungi resepsionis." }, { status: 409 });
    }
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Pendaftaran akun belum berhasil. Periksa kembali data Anda." }, { status: 500 });
  }
}
