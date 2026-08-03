-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT NOT NULL,
    "capacity" INTEGER,
    "minAdvanceDays" INTEGER NOT NULL,
    "paymentType" TEXT NOT NULL,
    "finalDueDays" INTEGER NOT NULL,
    "monthlyLimitPerMember" INTEGER,
    "yearlyLimitPerMember" INTEGER,
    "pricingUnit" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "maxHoursPerBooking" INTEGER,
    "overtimeHourlyCents" INTEGER,
    "shiftOptions" TEXT,
    "exclusiveVenue" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spaceId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_DEPOSIT',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerCpf" TEXT NOT NULL,
    "shiftLabel" TEXT,
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
    CONSTRAINT "Booking_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Space_slug_key" ON "Space"("slug");

-- CreateIndex
CREATE INDEX "Booking_spaceId_date_idx" ON "Booking"("spaceId", "date");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_customerCpf_idx" ON "Booking"("customerCpf");
