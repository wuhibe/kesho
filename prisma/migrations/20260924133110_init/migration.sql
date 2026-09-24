-- CreateEnum
CREATE TYPE "LetterStatus" AS ENUM ('PENDING', 'SCHEDULED', 'SENDING', 'DELIVERED', 'UNDELIVERABLE');

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "deliveryDate" DATE NOT NULL,
    "timeZone" TEXT NOT NULL,
    "status" "LetterStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "claimedAt" TIMESTAMP(3),
    "resendEmailId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Letter_status_deliveryDate_idx" ON "Letter"("status", "deliveryDate");
