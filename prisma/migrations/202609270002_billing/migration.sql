ALTER TABLE "Doctor" ADD COLUMN "consultationFee" INTEGER NOT NULL DEFAULT 100000;
ALTER TABLE "Medicine" ADD COLUMN "reservedStock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_reservedStock_check" CHECK ("reservedStock" >= 0 AND "reservedStock" <= "stock");
CREATE TABLE "Bill" (
  "id" TEXT NOT NULL, "appointmentId" TEXT NOT NULL,
  "patientName" TEXT NOT NULL, "medicalRecordNo" TEXT NOT NULL,
  "total" INTEGER NOT NULL, "paidAt" TIMESTAMP(3), "paymentMethod" TEXT,
  "receivedAmount" INTEGER, "receivedBy" TEXT, "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bill_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Bill_total_check" CHECK ("total" >= 0),
  CONSTRAINT "Bill_payment_check" CHECK (
    ("paidAt" IS NULL AND "paymentMethod" IS NULL AND "receivedAmount" IS NULL AND "receivedBy" IS NULL)
    OR ("paidAt" IS NOT NULL AND "paymentMethod" IN ('CASH', 'QRIS') AND "receivedAmount" >= "total" AND "receivedBy" IS NOT NULL)
  )
);
CREATE TABLE "BillItem" (
  "id" TEXT NOT NULL, "billId" TEXT NOT NULL, "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL, "unit" TEXT NOT NULL, "unitPrice" INTEGER NOT NULL, "amount" INTEGER NOT NULL,
  CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillItem_amount_check" CHECK ("quantity" > 0 AND "unitPrice" >= 0 AND "amount" = "quantity"::BIGINT * "unitPrice")
);
CREATE UNIQUE INDEX "Bill_appointmentId_key" ON "Bill"("appointmentId");
CREATE INDEX "Bill_paidAt_createdAt_idx" ON "Bill"("paidAt", "createdAt");
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
