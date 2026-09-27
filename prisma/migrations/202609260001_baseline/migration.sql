-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PATIENT', 'RECEPTIONIST', 'DOCTOR', 'PHARMACIST');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_EXAMINATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'CALLED', 'IN_ROOM', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "medicalRecordNo" TEXT NOT NULL,
    "nik" TEXT,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "address" TEXT,
    "phone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "allergies" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientGuardian" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientGuardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "specialization" TEXT,
    "roomLabel" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "quota" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "queueNumber" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "calledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueAutoCall" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "sourceAppointmentId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "calledQueueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueAutoCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueAnnouncement" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "queueNumber" TEXT NOT NULL,
    "roomLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimToken" TEXT,
    "claimedUntil" TIMESTAMP(3),
    "playedAt" TIMESTAMP(3),

    CONSTRAINT "QueueAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "complaint" TEXT,
    "physicalExam" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "form" TEXT,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "dispensedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthRateLimit_expiresAt_idx" ON "AuthRateLimit"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_medicalRecordNo_key" ON "Patient"("medicalRecordNo");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_nik_key" ON "Patient"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "PatientGuardian_patientId_userId_key" ON "PatientGuardian"("patientId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_appointmentId_key" ON "Queue"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "QueueAutoCall_sourceAppointmentId_key" ON "QueueAutoCall"("sourceAppointmentId");

-- CreateIndex
CREATE INDEX "QueueAutoCall_dueAt_processedAt_cancelledAt_idx" ON "QueueAutoCall"("dueAt", "processedAt", "cancelledAt");

-- CreateIndex
CREATE INDEX "QueueAnnouncement_playedAt_claimedUntil_createdAt_idx" ON "QueueAnnouncement"("playedAt", "claimedUntil", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON "MedicalRecord"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_medicalRecordId_key" ON "Prescription"("medicalRecordId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientGuardian" ADD CONSTRAINT "PatientGuardian_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientGuardian" ADD CONSTRAINT "PatientGuardian_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
