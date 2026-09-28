ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "PasswordReset" (
 "id" TEXT NOT NULL PRIMARY KEY, "tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL, "usedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");
CREATE TABLE "AccountAudit" (
 "id" TEXT NOT NULL PRIMARY KEY, "actorId" TEXT NOT NULL, "targetId" TEXT NOT NULL,
 "action" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AccountAudit_targetId_createdAt_idx" ON "AccountAudit"("targetId","createdAt");
ALTER TABLE "Prescription" ADD COLUMN "stockHoldReason" TEXT,
 ADD COLUMN "stockHeldAt" TIMESTAMP(3), ADD COLUMN "stockHeldBy" TEXT,
 ADD COLUMN "stockResumedAt" TIMESTAMP(3), ADD COLUMN "stockResumedBy" TEXT;
