/*
  Warnings:

  - You are about to drop the column `customerCpf` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_DEPOSIT',
    "memberId" TEXT NOT NULL,
    "shiftLabel" TEXT,
    "startHour" INTEGER,
    "hours" INTEGER,
    "totalCents" INTEGER NOT NULL,
    "depositCents" INTEGER NOT NULL,
    "finalCents" INTEGER NOT NULL,
    "depositPaidAt" DATETIME,
    "finalDueDate" DATETIME NOT NULL,
    "finalPaidAt" DATETIME,
    "finalReminderSentAt" DATETIME,
    "googleEventId" TEXT,
    "cancelledAt" DATETIME,
    "cancelledReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("cancelledAt", "cancelledReason", "createdAt", "date", "depositCents", "depositPaidAt", "finalCents", "finalDueDate", "finalPaidAt", "finalReminderSentAt", "googleEventId", "hours", "id", "shiftLabel", "spaceId", "startHour", "status", "totalCents", "updatedAt") SELECT "cancelledAt", "cancelledReason", "createdAt", "date", "depositCents", "depositPaidAt", "finalCents", "finalDueDate", "finalPaidAt", "finalReminderSentAt", "googleEventId", "hours", "id", "shiftLabel", "spaceId", "startHour", "status", "totalCents", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_spaceId_date_idx" ON "Booking"("spaceId", "date");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cpf_key" ON "Member"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Member_googleId_key" ON "Member"("googleId");
