-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('Admin', 'Distributor', 'Accountant', 'Manager');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('Active', 'Inactive', 'Suspended');

-- CreateTable
CREATE TABLE "team_members" (
    "member_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "role" "TeamMemberRole" NOT NULL DEFAULT 'Distributor',
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'Active',
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "dashboard_stats" (
    "stat_id" TEXT NOT NULL,
    "total_clients" INTEGER NOT NULL DEFAULT 0,
    "total_releases" INTEGER NOT NULL DEFAULT 0,
    "active_submissions" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "clients_growth" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "releases_growth" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "submissions_growth" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "revenue_growth" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_stats_pkey" PRIMARY KEY ("stat_id")
);

-- CreateTable
CREATE TABLE "recent_activities" (
    "activity_id" TEXT NOT NULL,
    "type" VARCHAR NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT,
    "user_id" TEXT,
    "release_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateIndex
CREATE INDEX "team_members_role_status_idx" ON "team_members"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_stats_date_key" ON "dashboard_stats"("date");

-- CreateIndex
CREATE INDEX "recent_activities_type_created_at_idx" ON "recent_activities"("type", "created_at");

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
