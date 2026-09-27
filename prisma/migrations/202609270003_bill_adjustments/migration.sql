ALTER TABLE "BillItem" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'MEDICINE';
UPDATE "BillItem" SET "kind" = 'CONSULTATION' WHERE "unit" = 'layanan' AND "description" LIKE 'Konsultasi %';
CREATE TABLE "BillAdjustment" (
  "id" TEXT NOT NULL PRIMARY KEY, "billId" TEXT NOT NULL,
  "kind" TEXT NOT NULL, "amount" INTEGER NOT NULL, "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING', "requestedById" TEXT NOT NULL,
  "requestedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedById" TEXT, "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3), "reviewNote" TEXT,
  "settledById" TEXT, "settledBy" TEXT, "settledAt" TIMESTAMP(3),
  "settlementMethod" TEXT, "settlementReference" TEXT,
  CONSTRAINT "BillAdjustment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BillAdjustment_kind_check" CHECK ("kind" IN ('CORRECTION','REFUND')),
  CONSTRAINT "BillAdjustment_status_check" CHECK ("status" IN ('PENDING','APPROVED','REJECTED','SETTLED')),
  CONSTRAINT "BillAdjustment_amount_check" CHECK ("amount" <> 0 AND ("kind" <> 'REFUND' OR "amount" > 0)),
  CONSTRAINT "BillAdjustment_settlement_check" CHECK ("status" <> 'SETTLED' OR ("kind" = 'REFUND' AND "settledAt" IS NOT NULL AND "settledById" IS NOT NULL AND "settlementMethod" IN ('CASH','TRANSFER')))
);
CREATE INDEX "BillAdjustment_status_createdAt_idx" ON "BillAdjustment"("status","createdAt");
CREATE INDEX "BillAdjustment_billId_status_idx" ON "BillAdjustment"("billId","status");
CREATE UNIQUE INDEX "BillAdjustment_pending_correction" ON "BillAdjustment"("billId") WHERE "kind" = 'CORRECTION' AND "status" = 'PENDING';
