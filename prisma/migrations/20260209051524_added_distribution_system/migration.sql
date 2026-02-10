-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('Pending', 'InProgress', 'Distributed', 'Failed', 'Declined');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PendingReview', 'Approved', 'Declined');

-- CreateEnum
CREATE TYPE "ClientRole" AS ENUM ('Artist', 'Label', 'Manager', 'Producer');

-- CreateTable
CREATE TABLE "distributions" (
    "distribution_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "status" "DistributionStatus" NOT NULL DEFAULT 'Pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "distributed_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("distribution_id")
);

-- CreateTable
CREATE TABLE "platform_distributions" (
    "platform_dist_id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "platform" VARCHAR NOT NULL,
    "status" "DistributionStatus" NOT NULL DEFAULT 'Pending',
    "platform_release_id" VARCHAR,
    "platform_url" VARCHAR,
    "streams" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "live_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_distributions_pkey" PRIMARY KEY ("platform_dist_id")
);

-- CreateTable
CREATE TABLE "distribution_notes" (
    "note_id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_notes_pkey" PRIMARY KEY ("note_id")
);

-- CreateTable
CREATE TABLE "distributor_clients" (
    "client_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ClientRole" NOT NULL DEFAULT 'Artist',
    "phone_number" VARCHAR,
    "total_releases" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "one_time_password" VARCHAR,
    "otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "client_back_catalogues" (
    "catalogue_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "artist_name" VARCHAR NOT NULL,
    "genre" VARCHAR,
    "total_releases" INTEGER NOT NULL DEFAULT 0,
    "release_types" VARCHAR,
    "current_distributor" VARCHAR,
    "label" VARCHAR,
    "total_tracks" INTEGER NOT NULL DEFAULT 0,
    "date_range_start" DATE,
    "date_range_end" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_back_catalogues_pkey" PRIMARY KEY ("catalogue_id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "submission_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PendingReview',
    "type" VARCHAR NOT NULL,
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("submission_id")
);

-- CreateIndex
CREATE INDEX "distributions_distributor_id_status_idx" ON "distributions"("distributor_id", "status");

-- CreateIndex
CREATE INDEX "distributions_user_id_status_idx" ON "distributions"("user_id", "status");

-- CreateIndex
CREATE INDEX "distributions_release_id_idx" ON "distributions"("release_id");

-- CreateIndex
CREATE INDEX "platform_distributions_distribution_id_idx" ON "platform_distributions"("distribution_id");

-- CreateIndex
CREATE INDEX "platform_distributions_platform_status_idx" ON "platform_distributions"("platform", "status");

-- CreateIndex
CREATE INDEX "distribution_notes_distribution_id_idx" ON "distribution_notes"("distribution_id");

-- CreateIndex
CREATE INDEX "distributor_clients_distributor_id_is_active_idx" ON "distributor_clients"("distributor_id", "is_active");

-- CreateIndex
CREATE INDEX "distributor_clients_user_id_idx" ON "distributor_clients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_clients_distributor_id_user_id_key" ON "distributor_clients"("distributor_id", "user_id");

-- CreateIndex
CREATE INDEX "client_back_catalogues_distributor_id_idx" ON "client_back_catalogues"("distributor_id");

-- CreateIndex
CREATE INDEX "client_back_catalogues_user_id_idx" ON "client_back_catalogues"("user_id");

-- CreateIndex
CREATE INDEX "submissions_distributor_id_status_idx" ON "submissions"("distributor_id", "status");

-- CreateIndex
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_distributions" ADD CONSTRAINT "platform_distributions_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "distributions"("distribution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_notes" ADD CONSTRAINT "distribution_notes_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "distributions"("distribution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_notes" ADD CONSTRAINT "distribution_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_clients" ADD CONSTRAINT "distributor_clients_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_clients" ADD CONSTRAINT "distributor_clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_back_catalogues" ADD CONSTRAINT "client_back_catalogues_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_back_catalogues" ADD CONSTRAINT "client_back_catalogues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;
