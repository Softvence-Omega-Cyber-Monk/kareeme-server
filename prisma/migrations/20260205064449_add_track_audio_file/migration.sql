/*
  Warnings:

  - You are about to drop the `tracks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "track_artists" DROP CONSTRAINT "track_artists_track_id_fkey";

-- DropForeignKey
ALTER TABLE "tracks" DROP CONSTRAINT "tracks_release_id_fkey";

-- DropTable
DROP TABLE "tracks";

-- CreateTable
CREATE TABLE "Track" (
    "trackId" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "trackNumber" INTEGER,
    "trackTitle" TEXT,
    "trackGenre" TEXT,
    "trackMix" TEXT,
    "explicitContent" BOOLEAN DEFAULT false,
    "trackLanguage" TEXT,
    "trackPublisher" TEXT,
    "originalReleaseDate" TIMESTAMP(3),
    "trackIsrc" TEXT,
    "territoryRestrictions" TEXT,
    "audioFileUrl" TEXT,
    "audioFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("trackId")
);

-- CreateIndex
CREATE INDEX "Track_releaseId_idx" ON "Track"("releaseId");

-- CreateIndex
CREATE INDEX "Track_audioFileId_idx" ON "Track"("audioFileId");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "file_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("trackId") ON DELETE CASCADE ON UPDATE CASCADE;
