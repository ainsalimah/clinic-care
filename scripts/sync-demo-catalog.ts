import { randomBytes } from "node:crypto";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const departments = [
  { name: "Poli Umum", description: "Pelayanan kesehatan umum primer, pemeriksaan rutin, dan konsultasi medis dasar." },
  { name: "Poli Anak", description: "Pelayanan kesehatan bayi, balita, anak, serta konsultasi tumbuh kembang." },
  { name: "Poli Gigi", description: "Pemeriksaan gigi dan mulut, pembersihan karang gigi, penambalan, dan pencabutan." },
  { name: "Poli Penyakit Dalam", description: "Diagnosis dan penanganan penyakit organ dalam untuk pasien dewasa dan lansia." },
] as const;

const doctors = [
  {
    email: "dokter.hendra@klinikcare.com",
    fullName: "dr. Hendra Pratama",
    department: "Poli Umum",
    specialization: "Dokter Umum",
    roomLabel: "Ruang Umum 1",
    licenseNumber: "SIP.503/442/DU/2022",
    consultationFee: 100_000,
    startTime: "08:00",
    endTime: "12:00",
    quota: 25,
  },
  {
    email: "dokter.maya@klinikcare.com",
    fullName: "dr. Maya Indah, Sp.A",
    department: "Poli Anak",
    specialization: "Spesialis Anak (Pediatri)",
    roomLabel: "Ruang Anak 1",
    licenseNumber: "SIP.503/118/SPA/2021",
    consultationFee: 125_000,
    startTime: "09:00",
    endTime: "13:00",
    quota: 20,
  },
  {
    email: "dokter.fadhil@klinikcare.com",
    fullName: "drg. Fadhil Ramadhan",
    department: "Poli Gigi",
    specialization: "Dokter Gigi & Mulut",
    roomLabel: "Ruang Gigi 1",
    licenseNumber: "SIP.503/245/DG/2023",
    consultationFee: 135_000,
    startTime: "13:00",
    endTime: "17:00",
    quota: 15,
  },
  {
    email: "dokter.bambang@klinikcare.com",
    fullName: "dr. Bambang Setiawan, Sp.PD",
    department: "Poli Penyakit Dalam",
    specialization: "Spesialis Penyakit Dalam",
    roomLabel: "Ruang Penyakit Dalam 1",
    licenseNumber: "SIP.503/089/SPD/2019",
    consultationFee: 175_000,
    startTime: "14:00",
    endTime: "18:00",
    quota: 15,
  },
] as const;

async function main() {
  if (process.env.SYNC_DEMO_CATALOG !== "true") {
    throw new Error("Set SYNC_DEMO_CATALOG=true untuk menyinkronkan katalog demo.");
  }

  const departmentIds = new Map<string, string>();
  for (const department of departments) {
    const record = await prisma.department.upsert({
      where: { name: department.name },
      update: { description: department.description },
      create: department,
    });
    departmentIds.set(record.name, record.id);
  }

  for (const item of doctors) {
    const departmentId = departmentIds.get(item.department);
    if (!departmentId) throw new Error(`Poli ${item.department} tidak ditemukan.`);

    const generatedPassword = await bcrypt.hash(randomBytes(32).toString("base64url"), 10);
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: { name: item.fullName, role: Role.DOCTOR, isActive: true },
      create: {
        email: item.email,
        name: item.fullName,
        passwordHash: generatedPassword,
        role: Role.DOCTOR,
        isActive: true,
      },
    });

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        departmentId,
        fullName: item.fullName,
        specialization: item.specialization,
        roomLabel: item.roomLabel,
        licenseNumber: item.licenseNumber,
        consultationFee: item.consultationFee,
      },
      create: {
        userId: user.id,
        departmentId,
        fullName: item.fullName,
        specialization: item.specialization,
        roomLabel: item.roomLabel,
        licenseNumber: item.licenseNumber,
        consultationFee: item.consultationFee,
      },
    });

    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek += 1) {
      const existing = await prisma.schedule.findFirst({
        where: { doctorId: doctor.id, dayOfWeek },
        orderBy: { createdAt: "asc" },
      });
      const schedule = {
        departmentId,
        startTime: item.startTime,
        endTime: item.endTime,
        quota: item.quota,
      };

      if (existing) {
        await prisma.schedule.update({ where: { id: existing.id }, data: schedule });
      } else {
        await prisma.schedule.create({ data: { doctorId: doctor.id, dayOfWeek, ...schedule } });
      }
    }
  }

  const count = await prisma.doctor.count({ where: { user: { isActive: true } } });
  console.log(`Katalog demo tersinkron: ${count} dokter aktif.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
