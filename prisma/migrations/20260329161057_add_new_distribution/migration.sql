/*
  Warnings:

  - The values [PAID] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DistributorClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');

-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('Pending', 'InProgress', 'Approved', 'Distributed', 'Declined', 'TakedownRequested', 'TakenDown');

-- CreateEnum
CREATE TYPE "ClientBackCatalogueStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DISPUTED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "address_line" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postal_code" TEXT;

-- CreateTable
CREATE TABLE "distributor_clients" (
    "id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" "DistributorClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "contract_start" DATE,
    "contract_end" DATE,
    "notes" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributor_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributions" (
    "distribution_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" "DistributionStatus" NOT NULL DEFAULT 'Pending',
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "decline_reason" VARCHAR,
    "target_platforms" VARCHAR,
    "target_territories" VARCHAR,
    "scheduled_release_date" DATE,
    "live_date" DATE,
    "revenue_split_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("distribution_id")
);

-- CreateTable
CREATE TABLE "distribution_notes" (
    "id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" VARCHAR NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_back_catalogues" (
    "id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "label_name" VARCHAR,
    "distributor_name" VARCHAR,
    "upc" VARCHAR,
    "catalogue_number" VARCHAR,
    "release_artist" VARCHAR,
    "release_title" VARCHAR,
    "release_type" VARCHAR,
    "release_date" DATE,
    "p_line" VARCHAR,
    "c_line" VARCHAR,
    "status" "ClientBackCatalogueStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_back_catalogues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "distributor_clients_distributor_id_idx" ON "distributor_clients"("distributor_id");

-- CreateIndex
CREATE INDEX "distributor_clients_client_id_idx" ON "distributor_clients"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "distributor_clients_distributor_id_client_id_key" ON "distributor_clients"("distributor_id", "client_id");

-- CreateIndex
CREATE INDEX "distributions_release_id_idx" ON "distributions"("release_id");

-- CreateIndex
CREATE INDEX "distributions_distributor_id_idx" ON "distributions"("distributor_id");

-- CreateIndex
CREATE INDEX "distributions_client_id_idx" ON "distributions"("client_id");

-- CreateIndex
CREATE INDEX "distributions_status_idx" ON "distributions"("status");

-- CreateIndex
CREATE INDEX "distribution_notes_distribution_id_idx" ON "distribution_notes"("distribution_id");

-- CreateIndex
CREATE INDEX "distribution_notes_user_id_idx" ON "distribution_notes"("user_id");

-- CreateIndex
CREATE INDEX "client_back_catalogues_distributor_id_idx" ON "client_back_catalogues"("distributor_id");

-- CreateIndex
CREATE INDEX "client_back_catalogues_client_id_idx" ON "client_back_catalogues"("client_id");

-- AddForeignKey
ALTER TABLE "distributor_clients" ADD CONSTRAINT "distributor_clients_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributor_clients" ADD CONSTRAINT "distributor_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributions" ADD CONSTRAINT "distributions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_notes" ADD CONSTRAINT "distribution_notes_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "distributions"("distribution_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_notes" ADD CONSTRAINT "distribution_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_back_catalogues" ADD CONSTRAINT "client_back_catalogues_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_back_catalogues" ADD CONSTRAINT "client_back_catalogues_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
