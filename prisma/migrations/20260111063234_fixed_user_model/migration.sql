/*
  Warnings:

  - You are about to drop the `Accountant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Distributor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('VERIFICATION', 'RESET');

-- CreateEnum
CREATE TYPE "DistributionPlatform" AS ENUM ('All', 'YouTubeMusic', 'Spotify', 'AppleMusic', 'SoundCloud', 'Tidal', 'Audiomack', 'Deezer', 'iHeartRadio');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('image', 'docs', 'link', 'document', 'any', 'video', 'audio');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTOR', 'ACCOUNTANT', 'CLIENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- DropTable
DROP TABLE "Accountant";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Distributor";

-- DropTable
DROP TABLE "SuperAdmin";

-- CreateTable
CREATE TABLE "user_otps" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_instances" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL DEFAULT 'any',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_merge_jobs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "outputUrl" TEXT NOT NULL,
    "outputFileId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "errorMessage" TEXT,
    "sourceFileIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_merge_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "city" TEXT,
    "country" TEXT,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isNewReleaseAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "isEarningAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "isPlatformUpdatesOn" BOOLEAN NOT NULL DEFAULT true,
    "emailNotificationsOn" BOOLEAN NOT NULL DEFAULT true,
    "smsNotificationsOn" BOOLEAN NOT NULL DEFAULT true,
    "pushNotificationsOn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "emailNotificationsOn" BOOLEAN NOT NULL DEFAULT true,
    "smsNotificationsOn" BOOLEAN NOT NULL DEFAULT false,
    "pushNotificationsOn" BOOLEAN NOT NULL DEFAULT false,
    "tfaOn" BOOLEAN NOT NULL DEFAULT false,
    "passwordPolicyOn" BOOLEAN NOT NULL DEFAULT false,
    "ipBlockList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoDistributionOn" BOOLEAN NOT NULL DEFAULT true,
    "defaultDistributionPlatforms" "DistributionPlatform"[] DEFAULT ARRAY['All']::"DistributionPlatform"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultDistributionPlatforms" "DistributionPlatform"[] DEFAULT ARRAY['All']::"DistributionPlatform"[],
    "defaultGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "distributionTerritories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unnamed User',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isTFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "profilePictureUrl" TEXT,
    "profilePictureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_otps_userId_idx" ON "user_otps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "video_merge_jobs_jobId_key" ON "video_merge_jobs"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "video_merge_jobs_outputFileId_key" ON "video_merge_jobs"("outputFileId");

-- CreateIndex
CREATE INDEX "login_devices_userId_idx" ON "login_devices"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "user_notifications"("userId", "notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_key" ON "notification_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "client_settings_userId_key" ON "client_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "user_otps" ADD CONSTRAINT "user_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "login_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_merge_jobs" ADD CONSTRAINT "video_merge_jobs_outputFileId_fkey" FOREIGN KEY ("outputFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_devices" ADD CONSTRAINT "login_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_settings" ADD CONSTRAINT "client_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
