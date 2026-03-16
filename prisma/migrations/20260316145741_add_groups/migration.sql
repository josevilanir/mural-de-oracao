-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('PENDING', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GroupMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PrayerVisibility" AS ENUM ('PUBLIC', 'GROUP_ONLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'GROUP_JOIN_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_REQUEST_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_REQUEST_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_CREATION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_CREATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_PRAYER_REMOVAL_REQUEST';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "Prayer" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "visibility" "PrayerVisibility" NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "status" "GroupStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leaderId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "status" "GroupMemberStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerRemovalRequest" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "prayerId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,

    CONSTRAINT "PrayerRemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_userId_groupId_key" ON "GroupMember"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "Prayer" ADD CONSTRAINT "Prayer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRemovalRequest" ADD CONSTRAINT "PrayerRemovalRequest_prayerId_fkey" FOREIGN KEY ("prayerId") REFERENCES "Prayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRemovalRequest" ADD CONSTRAINT "PrayerRemovalRequest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerRemovalRequest" ADD CONSTRAINT "PrayerRemovalRequest_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
