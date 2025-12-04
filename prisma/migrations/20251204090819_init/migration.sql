-- CreateTable
CREATE TABLE "Client" (
    "clientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "profileImageUrl" TEXT,
    "isNewReleaseAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "isEarningAlertsOn" BOOLEAN NOT NULL DEFAULT true,
    "isPlatformUpdatesOn" BOOLEAN NOT NULL DEFAULT true,
    "defaultDistributionPlatforms" TEXT[],
    "defaultGenres" TEXT[],
    "distributionTerritorys" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("clientId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
