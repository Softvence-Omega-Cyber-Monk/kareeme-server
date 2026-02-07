-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('YouTube', 'Spotify', 'AppleMusic', 'SoundCloud', 'Audiomack', 'Deezer', 'TIDAL', 'iHeartRadio', 'AmazonMusic', 'Pandora');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('Active', 'Pending', 'Resolved', 'Disputed', 'Rejected');

-- CreateTable
CREATE TABLE "platform_analytics" (
    "analytics_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "date" DATE NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "free_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "free_views" INTEGER NOT NULL DEFAULT 0,
    "premium_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "premium_views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateTable
CREATE TABLE "assets" (
    "asset_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "artist" VARCHAR NOT NULL,
    "platform" "Platform" NOT NULL,
    "asset_type" VARCHAR,
    "thumbnail_url" VARCHAR,
    "published_date" DATE,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ad_supported" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "youtube_premium" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "release_id" TEXT,
    "track_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "geo_trends" (
    "geo_trend_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "country" VARCHAR NOT NULL,
    "region" VARCHAR,
    "date" DATE NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_trends_pkey" PRIMARY KEY ("geo_trend_id")
);

-- CreateTable
CREATE TABLE "claims" (
    "claim_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "claimant" VARCHAR,
    "platform" "Platform" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'Pending',
    "thumbnail_url" VARCHAR,
    "published_date" DATE,
    "description" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "ad_supported" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "youtube_premium" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "claimed_date" DATE,
    "resolved_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("claim_id")
);

-- CreateIndex
CREATE INDEX "platform_analytics_user_id_platform_year_month_idx" ON "platform_analytics"("user_id", "platform", "year", "month");

-- CreateIndex
CREATE INDEX "platform_analytics_platform_date_idx" ON "platform_analytics"("platform", "date");

-- CreateIndex
CREATE UNIQUE INDEX "platform_analytics_user_id_platform_date_key" ON "platform_analytics"("user_id", "platform", "date");

-- CreateIndex
CREATE INDEX "assets_user_id_platform_idx" ON "assets"("user_id", "platform");

-- CreateIndex
CREATE INDEX "assets_platform_total_earnings_idx" ON "assets"("platform", "total_earnings");

-- CreateIndex
CREATE INDEX "geo_trends_user_id_platform_year_month_idx" ON "geo_trends"("user_id", "platform", "year", "month");

-- CreateIndex
CREATE INDEX "geo_trends_country_earnings_idx" ON "geo_trends"("country", "earnings");

-- CreateIndex
CREATE UNIQUE INDEX "geo_trends_user_id_platform_country_region_date_key" ON "geo_trends"("user_id", "platform", "country", "region", "date");

-- CreateIndex
CREATE INDEX "claims_user_id_platform_status_idx" ON "claims"("user_id", "platform", "status");

-- CreateIndex
CREATE INDEX "claims_status_claimed_date_idx" ON "claims"("status", "claimed_date");

-- AddForeignKey
ALTER TABLE "platform_analytics" ADD CONSTRAINT "platform_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_trends" ADD CONSTRAINT "geo_trends_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
