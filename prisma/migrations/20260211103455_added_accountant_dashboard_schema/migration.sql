-- CreateTable
CREATE TABLE "accountant_settings" (
    "settings_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fullName" VARCHAR,
    "email" VARCHAR,
    "phone_number" VARCHAR,
    "profile_photo" VARCHAR,
    "default_currency" VARCHAR NOT NULL DEFAULT 'USD',
    "payment_gateway" VARCHAR NOT NULL DEFAULT 'Stripe',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accountant_settings_pkey" PRIMARY KEY ("settings_id")
);

-- CreateTable
CREATE TABLE "platform_earnings" (
    "earning_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" VARCHAR NOT NULL,
    "gross_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_earnings_pkey" PRIMARY KEY ("earning_id")
);

-- CreateTable
CREATE TABLE "pending_payments" (
    "payment_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" VARCHAR NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR NOT NULL DEFAULT 'Pending',
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "payment_history" (
    "history_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" VARCHAR NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "method" "PaymentMethodType" NOT NULL DEFAULT 'PAYPAL',
    "payment_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "client_financials" (
    "client_fin_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_name" VARCHAR NOT NULL,
    "client_email" VARCHAR NOT NULL,
    "total_earning" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pending_payment" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_financials_pkey" PRIMARY KEY ("client_fin_id")
);

-- CreateTable
CREATE TABLE "monthly_statements" (
    "statement_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "subtitle" VARCHAR,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "StatementStatus" NOT NULL DEFAULT 'PaymentNotRequired',
    "file_url" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_statements_pkey" PRIMARY KEY ("statement_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountant_settings_user_id_key" ON "accountant_settings"("user_id");

-- CreateIndex
CREATE INDEX "platform_earnings_user_id_year_month_idx" ON "platform_earnings"("user_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "platform_earnings_user_id_platform_month_year_key" ON "platform_earnings"("user_id", "platform", "month", "year");

-- CreateIndex
CREATE INDEX "pending_payments_client_id_status_idx" ON "pending_payments"("client_id", "status");

-- CreateIndex
CREATE INDEX "payment_history_client_id_payment_date_idx" ON "payment_history"("client_id", "payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "client_financials_client_id_key" ON "client_financials"("client_id");

-- CreateIndex
CREATE INDEX "monthly_statements_user_id_year_idx" ON "monthly_statements"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_statements_user_id_month_year_key" ON "monthly_statements"("user_id", "month", "year");

-- AddForeignKey
ALTER TABLE "accountant_settings" ADD CONSTRAINT "accountant_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_earnings" ADD CONSTRAINT "platform_earnings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_payments" ADD CONSTRAINT "pending_payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_financials" ADD CONSTRAINT "client_financials_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_statements" ADD CONSTRAINT "monthly_statements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
