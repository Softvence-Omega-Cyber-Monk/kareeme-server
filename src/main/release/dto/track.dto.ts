import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateTrackArtistDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Artist ID (if existing artist)',
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Client name',
  })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Name as it appears on the track',
  })
  @IsOptional()
  @IsString()
  nameOnTrack?: string;

  @ApiPropertyOptional({
    example: 'Primary Artist',
    description: 'Type of artist (Primary Artist, Featured Artist, etc.)',
  })
  @IsOptional()
  @IsString()
  artistType?: string;

  @ApiPropertyOptional({
    example: 'Composer, Lyricist',
    description: 'Songwriter role',
  })
  @IsOptional()
  @IsString()
  songwriterRole?: string;

  @ApiPropertyOptional({
    example: 'Chachi Jones',
    description: 'Real name of the artist',
  })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({
    example: '85%',
    description: 'Master split percentage',
  })
  @IsOptional()
  @IsString()
  masterSplit?: string;

  @ApiPropertyOptional({
    example: '1232343349',
    description: 'Spotify artist ID',
  })
  @IsOptional()
  @IsString()
  spotifyId?: string;

  @ApiPropertyOptional({
    example: 'apple:artist:someid',
    description: 'Apple Music artist ID',
  })
  @IsOptional()
  @IsString()
  appleId?: string;
}

export class CreateTrackDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Release ID this track belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  releaseId: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Track number in the release',
  })
  @IsOptional()
  @IsInt()
  trackNumber?: number;

  @ApiPropertyOptional({
    example: 'Midnight Reflections',
    description: 'Title of the track',
  })
  @IsOptional()
  @IsString()
  trackTitle?: string;

  @ApiPropertyOptional({
    example: 'Pop/R&B',
    description: 'Genre of the track',
  })
  @IsOptional()
  @IsString()
  trackGenre?: string;

  @ApiPropertyOptional({
    example: 'Original Mix',
    description: 'Mix/version of the track',
  })
  @IsOptional()
  @IsString()
  trackMix?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this track contain explicit content?',
  })
  @IsOptional()
  @IsBoolean()
  explicitContent?: boolean;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Language of the track',
  })
  @IsOptional()
  @IsString()
  trackLanguage?: string;

  @ApiPropertyOptional({
    example: 'OneIsOne Publishing',
    description: 'Publisher of the track',
  })
  @IsOptional()
  @IsString()
  trackPublisher?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Original release date of the track',
  })
  @IsOptional()
  @IsDateString()
  originalReleaseDate?: string;

  @ApiPropertyOptional({
    example: 'USRC17607839',
    description: 'ISRC code for the track',
  })
  @IsOptional()
  @IsString()
  trackIsrc?: string;

  @ApiPropertyOptional({
    example: 'None',
    description: 'Territory restrictions for this track',
  })
  @IsOptional()
  @IsString()
  territoryRestrictions?: string;

  @ApiPropertyOptional({
    example: 'https://s3.amazonaws.com/bucket/audio.mp3',
    description: 'URL to the audio file (optional - use upload endpoint instead)',
  })
  @IsOptional()
  @IsString()
  audioFileUrl?: string;

  @ApiPropertyOptional({
    type: [CreateTrackArtistDto],
    description: 'Artists associated with this track',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackArtistDto)
  trackArtists?: CreateTrackArtistDto[];
}

export class UpdateTrackDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Track number in the release',
  })
  @IsOptional()
  @IsInt()
  trackNumber?: number;

  @ApiPropertyOptional({
    example: 'Midnight Reflections',
    description: 'Title of the track',
  })
  @IsOptional()
  @IsString()
  trackTitle?: string;

  @ApiPropertyOptional({
    example: 'Pop/R&B',
    description: 'Genre of the track',
  })
  @IsOptional()
  @IsString()
  trackGenre?: string;

  @ApiPropertyOptional({
    example: 'Original Mix',
    description: 'Mix/version of the track',
  })
  @IsOptional()
  @IsString()
  trackMix?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this track contain explicit content?',
  })
  @IsOptional()
  @IsBoolean()
  explicitContent?: boolean;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Language of the track',
  })
  @IsOptional()
  @IsString()
  trackLanguage?: string;

  @ApiPropertyOptional({
    example: 'OneIsOne Publishing',
    description: 'Publisher of the track',
  })
  @IsOptional()
  @IsString()
  trackPublisher?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Original release date of the track',
  })
  @IsOptional()
  @IsDateString()
  originalReleaseDate?: string;

  @ApiPropertyOptional({
    example: 'USRC17607839',
    description: 'ISRC code for the track',
  })
  @IsOptional()
  @IsString()
  trackIsrc?: string;

  @ApiPropertyOptional({
    example: 'None',
    description: 'Territory restrictions for this track',
  })
  @IsOptional()
  @IsString()
  territoryRestrictions?: string;

  @ApiPropertyOptional({
    example: 'https://s3.amazonaws.com/bucket/audio.mp3',
    description: 'URL to the audio file',
  })
  @IsOptional()
  @IsString()
  audioFileUrl?: string;

  @ApiPropertyOptional({
    type: [CreateTrackArtistDto],
    description: 'Artists associated with this track',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackArtistDto)
  trackArtists?: CreateTrackArtistDto[];
}

export class UploadTrackAudioDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Audio file (MP3, WAV, FLAC, AAC, M4A - Max 100MB)',
  })
  audioFile: Express.Multer.File;
}