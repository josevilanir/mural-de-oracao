-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PRAYER_HIDDEN', 'PRAYER_APPROVED', 'GROUP_APPROVED', 'GROUP_REJECTED', 'GROUP_CREATED', 'GROUP_DELETED', 'JOIN_REQUEST_SUBMITTED', 'JOIN_REQUEST_APPROVED', 'JOIN_REQUEST_REJECTED', 'PRAYER_REMOVAL_APPROVED', 'PRAYER_REMOVAL_REJECTED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Prayer_groupId_createdAt_idx" ON "Prayer"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Prayer_authorId_createdAt_idx" ON "Prayer"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerAction_prayerId_userId_idx" ON "PrayerAction"("prayerId", "userId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
