-- AlterTable
ALTER TABLE "releases" ADD COLUMN     "album_level_artist_name" TEXT,
ADD COLUMN     "copyright_holder" TEXT,
ADD COLUMN     "label_name" TEXT,
ADD COLUMN     "lyricist_credits" TEXT,
ADD COLUMN     "master_splits" TEXT,
ADD COLUMN     "music_file_link" TEXT,
ADD COLUMN     "producer_credits" TEXT;
