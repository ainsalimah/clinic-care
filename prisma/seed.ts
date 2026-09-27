import { PrismaClient, Role, AppointmentStatus, QueueStatus, PrescriptionStatus, InventoryTransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Seed demo menghapus data. Hanya untuk database development dengan ALLOW_DEMO_SEED=true.");
  }
  console.log("🌱 Starting database seeding for KlinikCare...");

  // 1. Bersihkan data lama jika ada (idempotent)
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.queueAnnouncement.deleteMany();
  await prisma.queueAutoCall.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patientGuardian.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 2. Buat Pengguna (Users) untuk masing-masing Role
  await prisma.user.create({
    data: {
      name: "Admin Rani",
      email: "admin@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      name: "Dita Prameswari",
      email: "resepsionis@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.RECEPTIONIST,
    },
  });

  const doctorHendraUser = await prisma.user.create({
    data: {
      name: "dr. Hendra Pratama",
      email: "dokter.hendra@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.DOCTOR,
    },
  });

  const doctorMayaUser = await prisma.user.create({
    data: {
      name: "dr. Maya Indah, Sp.A",
      email: "dokter.maya@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.DOCTOR,
    },
  });

  const doctorFadhilUser = await prisma.user.create({
    data: {
      name: "drg. Fadhil Ramadhan",
      email: "dokter.fadhil@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.DOCTOR,
    },
  });

  const doctorBambangUser = await prisma.user.create({
    data: {
      name: "dr. Bambang Setiawan, Sp.PD",
      email: "dokter.bambang@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.DOCTOR,
    },
  });

  await prisma.user.create({
    data: {
      name: "Apt. Budi Santoso",
      email: "apoteker@klinikcare.com",
      passwordHash: defaultPassword,
      role: Role.PHARMACIST,
    },
  });

  const patientSariUser = await prisma.user.create({
    data: {
      name: "Sari Wulandari",
      email: "pasien.sari@gmail.com",
      passwordHash: defaultPassword,
      role: Role.PATIENT,
    },
  });

  console.log("✅ Users created.");

  // 3. Buat Departemen / Poli
  const poliUmum = await prisma.department.create({
    data: {
      name: "Poli Umum",
      description: "Pelayanan kesehatan umum primer dan konsultasi medis dasar",
    },
  });

  const poliAnak = await prisma.department.create({
    data: {
      name: "Poli Anak",
      description: "Pelayanan kesehatan bayi, balita, dan anak-anak",
    },
  });

  const poliGigi = await prisma.department.create({
    data: {
      name: "Poli Gigi",
      description: "Pemeriksaan kesehatan gigi, scaling, penambalan, dan cabut gigi",
    },
  });

  const poliPenyakitDalam = await prisma.department.create({
    data: {
      name: "Poli Penyakit Dalam",
      description: "Diagnosis dan penanganan penyakit organ dalam dewasa dan lansia",
    },
  });

  console.log("✅ Departments created.");

  // 4. Buat Profil Dokter
  const drHendra = await prisma.doctor.create({
    data: {
      userId: doctorHendraUser.id,
      departmentId: poliUmum.id,
      fullName: "dr. Hendra Pratama",
      roomLabel: "Ruang Umum 1",
      specialization: "Dokter Umum",
      licenseNumber: "SIP.503/442/DU/2022",
    },
  });

  const drMaya = await prisma.doctor.create({
    data: {
      userId: doctorMayaUser.id,
      departmentId: poliAnak.id,
      fullName: "dr. Maya Indah, Sp.A",
      roomLabel: "Ruang Anak 1",
      specialization: "Spesialis Anak (Pediatri)",
      licenseNumber: "SIP.503/118/SPA/2021",
    },
  });

  const drFadhil = await prisma.doctor.create({
    data: {
      userId: doctorFadhilUser.id,
      departmentId: poliGigi.id,
      fullName: "drg. Fadhil Ramadhan",
      roomLabel: "Ruang Gigi 1",
      specialization: "Dokter Gigi & Mulut",
      licenseNumber: "SIP.503/245/DG/2023",
    },
  });

  const drBambang = await prisma.doctor.create({
    data: {
      userId: doctorBambangUser.id,
      departmentId: poliPenyakitDalam.id,
      fullName: "dr. Bambang Setiawan, Sp.PD",
      roomLabel: "Ruang Penyakit Dalam 1",
      specialization: "Spesialis Penyakit Dalam",
      licenseNumber: "SIP.503/089/SPD/2019",
    },
  });

  console.log("✅ Doctors created.");

  // 5. Buat Jadwal Dokter (Schedules)
  // Senin - Jumat (Day 1 - 5)
  for (let day = 1; day <= 5; day++) {
    await prisma.schedule.create({
      data: {
        doctorId: drHendra.id,
        departmentId: poliUmum.id,
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "12:00",
        quota: 25,
      },
    });

    await prisma.schedule.create({
      data: {
        doctorId: drMaya.id,
        departmentId: poliAnak.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "13:00",
        quota: 20,
      },
    });

    await prisma.schedule.create({
      data: {
        doctorId: drFadhil.id,
        departmentId: poliGigi.id,
        dayOfWeek: day,
        startTime: "13:00",
        endTime: "17:00",
        quota: 15,
      },
    });

    await prisma.schedule.create({
      data: {
        doctorId: drBambang.id,
        departmentId: poliPenyakitDalam.id,
        dayOfWeek: day,
        startTime: "14:00",
        endTime: "18:00",
        quota: 15,
      },
    });
  }

  console.log("✅ Schedules created.");

  // 6. Buat Data Pasien (Digital Pasien & Lansia Walk-in Tanpa Akun/HP)
  // Pasien 1: Sari Wulandari (Punya akun)
  const patientSari = await prisma.patient.create({
    data: {
      userId: patientSariUser.id,
      medicalRecordNo: "RM-2026-0001",
      nik: "3201015506920002",
      fullName: "Sari Wulandari",
      dateOfBirth: new Date("1992-06-15"),
      gender: "FEMALE",
      address: "Jl. Mawar No. 14, Sukajadi, Bandung",
      phone: "081234567890",
      emergencyContactName: "Hendra Wijaya (Suami)",
      emergencyContactPhone: "081298765432",
      allergies: "Alergi Amoxicillin (gatal-gatal)",
    },
  });

  // Pasien 2: Anak Dimas Pratama (Pasien anak, wali: Ibu Sari)
  const patientDimas = await prisma.patient.create({
    data: {
      medicalRecordNo: "RM-2026-0002",
      nik: "3201011210180003",
      fullName: "Dimas Pratama",
      dateOfBirth: new Date("2018-10-12"),
      gender: "MALE",
      address: "Jl. Mawar No. 14, Sukajadi, Bandung",
      phone: "081234567890",
      emergencyContactName: "Sari Wulandari (Ibu)",
      emergencyContactPhone: "081234567890",
      allergies: "Tidak ada alergi",
    },
  });

  // Hubungkan Sari sebagai Wali Dimas
  await prisma.patientGuardian.create({
    data: {
      patientId: patientDimas.id,
      userId: patientSariUser.id,
      relationship: "Ibu Kandung",
    },
  });

  // Pasien 3: Bpk. Marto Suwito (Lansia 74 thn, TANPA Akun & HP sesuai PRD Bagian 5.2)
  const patientMarto = await prisma.patient.create({
    data: {
      medicalRecordNo: "RM-2026-0003",
      nik: "3201010107520001",
      fullName: "Bapak Marto Suwito",
      dateOfBirth: new Date("1952-07-01"),
      gender: "MALE",
      address: "Dusun Kencana RT 02/03, Kab. Bandung",
      phone: null, // Tidak punya HP
      emergencyContactName: "Bambang Suwito (Anak)",
      emergencyContactPhone: "085612345678",
      allergies: "Tidak ada",
    },
  });

  // Pasien 4: Ibu Siti Aminah (Pasien Walk-in)
  const patientSiti = await prisma.patient.create({
    data: {
      medicalRecordNo: "RM-2026-0004",
      nik: "3201014502800004",
      fullName: "Ibu Siti Aminah",
      dateOfBirth: new Date("1980-02-15"),
      gender: "FEMALE",
      address: "Jl. Melati Blok C No. 5",
      phone: "087811223344",
      emergencyContactName: "Rahmat (Suami)",
      emergencyContactPhone: "087899887766",
      allergies: "Penisilin",
    },
  });

  console.log("✅ Patients and guardians created.");

  // 7. Master Data Obat (Medicines) & Stok Awal
  const medicinesData = [
    { name: "Paracetamol 500mg", form: "Tablet", unit: "strip", price: 8000, stock: 150, minimumStock: 25 },
    { name: "Amoxicillin 500mg", form: "Kapsul", unit: "strip", price: 12000, stock: 80, minimumStock: 20 },
    { name: "Cetirizine 10mg", form: "Tablet", unit: "strip", price: 10000, stock: 65, minimumStock: 15 },
    { name: "Antasida Doen", form: "Tablet Kunyah", unit: "strip", price: 5000, stock: 95, minimumStock: 20 },
    { name: "Ambroxol Sirup 60ml", form: "Sirup", unit: "botol", price: 15000, stock: 4, minimumStock: 10 }, // Stok menipis
    { name: "Ibuprofen 400mg", form: "Tablet", unit: "strip", price: 9000, stock: 110, minimumStock: 20 },
    { name: "Salbutamol 2mg", form: "Tablet", unit: "strip", price: 7000, stock: 50, minimumStock: 15 },
    { name: "Vitamin C 500mg", form: "Tablet", unit: "strip", price: 6000, stock: 200, minimumStock: 30 },
    { name: "Cefixime 100mg", form: "Kapsul", unit: "strip", price: 25000, stock: 3, minimumStock: 10 }, // Stok menipis
    { name: "Metformin 500mg", form: "Tablet", unit: "strip", price: 8500, stock: 75, minimumStock: 15 },
  ];

  const createdMedicines: Record<string, string> = {};
  for (const m of medicinesData) {
    const med = await prisma.medicine.create({ data: m });
    createdMedicines[m.name] = med.id;

    // Catat transaksi saldo awal stok
    await prisma.inventoryTransaction.create({
      data: {
        medicineId: med.id,
        type: InventoryTransactionType.IN,
        quantity: m.stock,
        notes: "Saldo awal inventaris farmasi",
      },
    });
  }

  console.log("✅ Medicines and initial inventory transactions created.");

  // 8. Buat Contoh Kunjungan & Antrean Hari Ini
  const today = new Date();

  // Kunjungan 1: Bpk. Marto Suwito di Poli Umum (Sedang diperiksa dokter)
  const apptMarto = await prisma.appointment.create({
    data: {
      patientId: patientMarto.id,
      doctorId: drHendra.id,
      departmentId: poliUmum.id,
      appointmentDate: today,
      status: AppointmentStatus.IN_EXAMINATION,
      notes: "Pasien lansia walk-in diantar keluarga, keluhan pusing berputar dan lemas",
    },
  });

  await prisma.queue.create({
    data: {
      appointmentId: apptMarto.id,
      departmentId: poliUmum.id,
      queueNumber: "A-001",
      status: QueueStatus.IN_ROOM,
      calledAt: new Date(Date.now() - 10 * 60 * 1000), // 10 menit lalu
    },
  });

  // Kunjungan 2: Ibu Sari Wulandari di Poli Umum (Menunggu di ruang tunggu)
  const apptSari = await prisma.appointment.create({
    data: {
      patientId: patientSari.id,
      doctorId: drHendra.id,
      departmentId: poliUmum.id,
      appointmentDate: today,
      status: AppointmentStatus.CHECKED_IN,
      notes: "Kontrol keluhan batuk berdahak 3 hari",
    },
  });

  await prisma.queue.create({
    data: {
      appointmentId: apptSari.id,
      departmentId: poliUmum.id,
      queueNumber: "A-002",
      status: QueueStatus.WAITING,
    },
  });

  // Kunjungan 3: Dimas Pratama di Poli Anak (Menunggu panggilan)
  const apptDimas = await prisma.appointment.create({
    data: {
      patientId: patientDimas.id,
      doctorId: drMaya.id,
      departmentId: poliAnak.id,
      appointmentDate: today,
      status: AppointmentStatus.CHECKED_IN,
      notes: "Demam sejak kemarin malam, tidak mau makan",
    },
  });

  await prisma.queue.create({
    data: {
      appointmentId: apptDimas.id,
      departmentId: poliAnak.id,
      queueNumber: "B-001",
      status: QueueStatus.WAITING,
    },
  });

  // Kunjungan 4: Ibu Siti Aminah (Kunjungan Selesai, Resep sudah di Apotek)
  const apptSiti = await prisma.appointment.create({
    data: {
      patientId: patientSiti.id,
      doctorId: drHendra.id,
      departmentId: poliUmum.id,
      appointmentDate: today,
      status: AppointmentStatus.COMPLETED,
      notes: "Pemeriksaan dispepsia / maag akut",
    },
  });

  await prisma.queue.create({
    data: {
      appointmentId: apptSiti.id,
      departmentId: poliUmum.id,
      queueNumber: "A-003",
      status: QueueStatus.COMPLETED,
      calledAt: new Date(Date.now() - 40 * 60 * 1000),
      completedAt: new Date(Date.now() - 20 * 60 * 1000),
    },
  });

  // Rekam medis Ibu Siti
  const medRecordSiti = await prisma.medicalRecord.create({
    data: {
      appointmentId: apptSiti.id,
      patientId: patientSiti.id,
      doctorId: drHendra.id,
      complaint: "Nyeri ulu hati terasa perih terbakar, mual terutama saat terlambat makan.",
      physicalExam: "TD: 120/80 mmHg, Nadi: 82x/m, Nyeri tekan epigastrium (+), Bising usus normal.",
      diagnosis: "K29.7 - Gastritis Akut (Dispepsia Sindrom)",
      treatment: "Edukasi pola makan teratur, hindari pedas dan asam, istirahat cukup, resep antasida & vitamin.",
    },
  });

  // Resep untuk Ibu Siti di Apotek (Status: READY / Siap Diambil)
  const prescriptionSiti = await prisma.prescription.create({
    data: {
      medicalRecordId: medRecordSiti.id,
      patientId: patientSiti.id,
      doctorId: drHendra.id,
      status: PrescriptionStatus.READY,
      notes: "Harap minum antasida 1 jam sebelum makan atau saat perut kosong.",
    },
  });

  const antasidaId = createdMedicines["Antasida Doen"];
  const vitCId = createdMedicines["Vitamin C 500mg"];

  if (antasidaId) {
    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: prescriptionSiti.id,
        medicineId: antasidaId,
        dosage: "1 tablet kunyah",
        quantity: 10,
        instruction: "3x sehari 1 tablet dikunyah 1 jam sebelum makan",
      },
    });
  }

  if (vitCId) {
    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: prescriptionSiti.id,
        medicineId: vitCId,
        dosage: "500mg",
        quantity: 10,
        instruction: "1x sehari 1 tablet sesudah makan pagi",
      },
    });
  }

  console.log("✅ Sample appointments, queues, medical record, and prescriptions created.");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
