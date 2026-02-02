-- CreateTable
CREATE TABLE "releases" (
    "release_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "release_date" DATE,
    "pre_order_date" DATE,
    "release_title" VARCHAR,
    "type_of_release" VARCHAR,
    "genre" VARCHAR,
    "language" VARCHAR,
    "is_explicit_content" BOOLEAN,
    "has_external_rights_holder" BOOLEAN,
    "has_dolby_atmos_version" BOOLEAN,
    "has_extended_mix_for_dj_stores" BOOLEAN,
    "additional_details" VARCHAR,
    "has_artist_on_spotify" BOOLEAN,
    "has_music_video" BOOLEAN,
    "status" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("release_id")
);

-- CreateTable
CREATE TABLE "artists" (
    "artist_id" TEXT NOT NULL,
    "name" VARCHAR,
    "email" VARCHAR,
    "phone" VARCHAR,
    "address" VARCHAR,
    "soundcloud_profile" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("artist_id")
);

-- CreateTable
CREATE TABLE "release_artists" (
    "release_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "role" VARCHAR,

    CONSTRAINT "release_artists_pkey" PRIMARY KEY ("release_id","artist_id")
);

-- CreateTable
CREATE TABLE "labels" (
    "label_id" TEXT NOT NULL,
    "name" VARCHAR,
    "attorney" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("label_id")
);

-- CreateTable
CREATE TABLE "release_territories" (
    "release_id" TEXT NOT NULL,
    "territory" VARCHAR NOT NULL,

    CONSTRAINT "release_territories_pkey" PRIMARY KEY ("release_id","territory")
);

-- CreateTable
CREATE TABLE "split_sheet_agreements" (
    "split_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "song_title" VARCHAR,
    "isrc" VARCHAR,
    "release_date" DATE,
    "record_label_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_sheet_agreements_pkey" PRIMARY KEY ("split_id")
);

-- CreateTable
CREATE TABLE "contributors" (
    "contributor_id" TEXT NOT NULL,
    "split_id" TEXT NOT NULL,
    "full_name" VARCHAR,
    "contribution" VARCHAR,
    "email" VARCHAR,
    "phone" VARCHAR,
    "address" VARCHAR,
    "publisher" VARCHAR,
    "affiliation" VARCHAR,
    "ipi_cae_number" VARCHAR,
    "percentage_split" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributors_pkey" PRIMARY KEY ("contributor_id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "track_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "track_number" INTEGER,
    "track_title" VARCHAR,
    "track_genre" VARCHAR,
    "track_mix" VARCHAR,
    "explicit_content" BOOLEAN,
    "track_language" VARCHAR,
    "track_publisher" VARCHAR,
    "original_release_date" DATE,
    "track_isrc" VARCHAR,
    "territory_restrictions" VARCHAR,
    "audio_file_url" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "track_artists" (
    "track_artist_id" TEXT NOT NULL,
    "track_id" TEXT NOT NULL,
    "artist_id" TEXT,
    "client_name" VARCHAR,
    "name_on_track" VARCHAR,
    "artist_type" VARCHAR,
    "songwriter_role" VARCHAR,
    "real_name" VARCHAR,
    "master_split" VARCHAR,
    "spotify_id" VARCHAR,
    "apple_id" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_artists_pkey" PRIMARY KEY ("track_artist_id")
);

-- CreateTable
CREATE TABLE "publishers" (
    "publisher_id" TEXT NOT NULL,
    "name" VARCHAR,
    "contact_info" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("publisher_id")
);

-- CreateTable
CREATE TABLE "back_catalogue" (
    "catalogue_id" TEXT NOT NULL,
    "release_id" TEXT NOT NULL,
    "label_name" VARCHAR,
    "distributor" VARCHAR,
    "upc" VARCHAR,
    "catalogue_number" VARCHAR,
    "release_artist" VARCHAR,
    "release_title" VARCHAR,
    "release_type" VARCHAR,
    "release_date" DATE,
    "release_p_line" VARCHAR,
    "release_c_line" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "back_catalogue_pkey" PRIMARY KEY ("catalogue_id")
);

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_artists" ADD CONSTRAINT "release_artists_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_artists" ADD CONSTRAINT "release_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_territories" ADD CONSTRAINT "release_territories_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_sheet_agreements" ADD CONSTRAINT "split_sheet_agreements_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "split_sheet_agreements" ADD CONSTRAINT "split_sheet_agreements_record_label_id_fkey" FOREIGN KEY ("record_label_id") REFERENCES "labels"("label_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributors" ADD CONSTRAINT "contributors_split_id_fkey" FOREIGN KEY ("split_id") REFERENCES "split_sheet_agreements"("split_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_artists" ADD CONSTRAINT "track_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "back_catalogue" ADD CONSTRAINT "back_catalogue_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("release_id") ON DELETE CASCADE ON UPDATE CASCADE;
