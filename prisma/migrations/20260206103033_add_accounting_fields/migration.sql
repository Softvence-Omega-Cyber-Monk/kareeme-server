-- CreateEnum
CREATE TYPE "StatementStatus" AS ENUM ('Paid', 'PaymentRequired', 'PaymentSubmitted', 'PaymentNotRequired', 'Pending');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Submitted', 'Paid', 'Failed', 'Cancelled');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Income', 'Expense', 'Payment', 'Refund', 'Adjustment');

-- CreateTable
CREATE TABLE "statements" (
    "statement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "statement_month" INTEGER NOT NULL,
    "statement_year" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "issued_on" TIMESTAMP(3),
    "paid_on" TIMESTAMP(3),
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_expenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "StatementStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statements_pkey" PRIMARY KEY ("statement_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "source" VARCHAR,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "release_id" TEXT,
    "track_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "deal_statuses" (
    "deal_status_id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account" VARCHAR NOT NULL,
    "artist_name" VARCHAR,
    "release_title" VARCHAR,
    "opening_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "release_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_statuses_pkey" PRIMARY KEY ("deal_status_id")
);

-- CreateTable
CREATE TABLE "statement_releases" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "artist" VARCHAR NOT NULL,
    "upc" VARCHAR,
    "isrc" VARCHAR,
    "asset_id" VARCHAR,
    "asset_type" VARCHAR,
    "amount" DECIMAL(15,2) NOT NULL,
    "release_id" TEXT,
    "track_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_territories" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "country" VARCHAR NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_platforms" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "platform" VARCHAR NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statement_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "payment_request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "payment_method" VARCHAR,
    "payment_details" JSONB,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "transaction_ref" VARCHAR,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("payment_request_id")
);

-- CreateIndex
CREATE INDEX "statements_user_id_statement_year_statement_month_idx" ON "statements"("user_id", "statement_year", "statement_month");

-- CreateIndex
CREATE UNIQUE INDEX "statements_user_id_statement_month_statement_year_key" ON "statements"("user_id", "statement_month", "statement_year");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date");

-- CreateIndex
CREATE INDEX "transactions_statement_id_type_idx" ON "transactions"("statement_id", "type");

-- CreateIndex
CREATE INDEX "transactions_type_date_idx" ON "transactions"("type", "date");

-- CreateIndex
CREATE INDEX "deal_statuses_statement_id_idx" ON "deal_statuses"("statement_id");

-- CreateIndex
CREATE INDEX "deal_statuses_user_id_idx" ON "deal_statuses"("user_id");

-- CreateIndex
CREATE INDEX "statement_releases_statement_id_idx" ON "statement_releases"("statement_id");

-- CreateIndex
CREATE INDEX "statement_territories_statement_id_idx" ON "statement_territories"("statement_id");

-- CreateIndex
CREATE INDEX "statement_platforms_statement_id_idx" ON "statement_platforms"("statement_id");

-- CreateIndex
CREATE INDEX "payment_requests_user_id_status_idx" ON "payment_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "payment_requests_status_requested_at_idx" ON "payment_requests"("status", "requested_at");

-- AddForeignKey
ALTER TABLE "statements" ADD CONSTRAINT "statements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("statement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_statuses" ADD CONSTRAINT "deal_statuses_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "statements"("statement_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_statuses" ADD CONSTRAINT "deal_statuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
