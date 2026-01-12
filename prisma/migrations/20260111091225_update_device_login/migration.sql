/*
  Warnings:

  - A unique constraint covering the columns `[userId,userAgent]` on the table `login_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "OtpType" ADD VALUE 'TFA_ENABLE';

-- CreateIndex
CREATE UNIQUE INDEX "login_devices_userId_userAgent_key" ON "login_devices"("userId", "userAgent");
