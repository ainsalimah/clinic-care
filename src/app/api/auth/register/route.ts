import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { getClinicDateKey } from "@/lib/clinic-time";

export async function POST(req: Request) {
  try {
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

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const existingEmail = await tx.user.findUnique({ where: { email } });
      if (existingEmail) return { error: "Email sudah digunakan. Silakan masuk atau gunakan email lain." };

      const existingPatient = await tx.patient.findUnique({ where: { nik } });
      if (existingPatient && (existingPatient.userId || existingPatient.fullName.toLocaleLowerCase("id-ID") !== fullName.toLocaleLowerCase("id-ID") || existingPatient.dateOfBirth.toISOString().slice(0, 10) !== body.dateOfBirth)) {
        return { error: "Data mungkin sudah terdaftar. Hubungi resepsionis untuk menghubungkan akun dengan nomor rekam medis yang sudah ada." };
      }

      const user = await tx.user.create({
        data: { name: fullName, email, passwordHash, role: Role.PATIENT },
      });

      const patient = existingPatient
        ? await tx.patient.update({ where: { id: existingPatient.id }, data: { userId: user.id } })
        : await tx.patient.create({
            data: {
              userId: user.id,
              medicalRecordNo: `RM-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
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
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ error: "Pendaftaran akun belum berhasil. Periksa kembali data Anda." }, { status: 500 });
  }
}
