import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseArtistResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  artistId: string;

  @ApiPropertyOptional({ example: 'Primary Artist' })
  role?: string;

  @ApiPropertyOptional({
    example: { artistId: '123', name: 'Gemini Chachi', email: 'artist@example.com' },
  })
  artist?: {
    artistId: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export class ReleaseTerritoryResponseDto {
  @ApiProperty({ example: 'US' })
  territory: string;
}

export class AudioFileInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'track-audio.mp3' })
  filename: string;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/audio/uuid.mp3' })
  url: string;

  @ApiProperty({ example: 5242880 })
  size: number;

  @ApiProperty({ example: 'audio/mpeg' })
  mimeType: string;
}

export class TrackResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  trackId: string;

  @ApiPropertyOptional({ example: 1 })
  trackNumber?: number;

  @ApiPropertyOptional({ example: 'Midnight Reflections' })
  trackTitle?: string;

  @ApiPropertyOptional({ example: 'Pop/R&B' })
  trackGenre?: string;

  @ApiPropertyOptional({ example: 'Original Mix' })
  trackMix?: string;

  @ApiPropertyOptional({ example: false })
  explicitContent?: boolean;

  @ApiPropertyOptional({ example: 'English' })
  trackLanguage?: string;

  @ApiPropertyOptional({ example: 'OneIsOne Publishing' })
  trackPublisher?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  originalReleaseDate?: string;

  @ApiPropertyOptional({ example: 'USRC17607839' })
  trackIsrc?: string;

  @ApiPropertyOptional({ example: 'None' })
  territoryRestrictions?: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/bucket/audio.mp3' })
  audioFileUrl?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  audioFileId?: string;

  @ApiPropertyOptional({ type: AudioFileInfoDto })
  uploadedFile?: AudioFileInfoDto;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class ReleaseResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  releaseId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiPropertyOptional({ example: '2025-03-15' })
  releaseDate?: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  preOrderDate?: string;

  @ApiPropertyOptional({ example: 'Midnight Reflections' })
  releaseTitle?: string;

  @ApiPropertyOptional({ example: 'Single' })
  typeOfRelease?: string;

  @ApiPropertyOptional({ example: 'Pop/R&B' })
  genre?: string;

  @ApiPropertyOptional({ example: 'English' })
  language?: string;

  @ApiPropertyOptional({ example: false })
  isExplicitContent?: boolean;

  @ApiPropertyOptional({ example: false })
  hasExternalRightsHolder?: boolean;

  @ApiPropertyOptional({ example: false })
  hasDolbyAtmosVersion?: boolean;

  @ApiPropertyOptional({ example: false })
  hasExtendedMixForDjStores?: boolean;

  @ApiPropertyOptional({ example: 'Additional information' })
  additionalDetails?: string;

  @ApiPropertyOptional({ example: true })
  hasArtistOnSpotify?: boolean;

  @ApiPropertyOptional({ example: true })
  hasMusicVideo?: boolean;

  @ApiPropertyOptional({ example: 'Live' })
  status?: string;

  @ApiPropertyOptional({ type: [ReleaseArtistResponseDto] })
  releaseArtists?: ReleaseArtistResponseDto[];

  @ApiPropertyOptional({ type: [ReleaseTerritoryResponseDto] })
  releaseTerritories?: ReleaseTerritoryResponseDto[];

  @ApiPropertyOptional({ type: [TrackResponseDto] })
  tracks?: TrackResponseDto[];

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class ReleaseListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  releaseId: string;

  @ApiPropertyOptional({ example: 'Midnight Reflections' })
  releaseTitle?: string;

  @ApiPropertyOptional({ example: 'Single' })
  typeOfRelease?: string;

  @ApiPropertyOptional({ example: '2025-03-15' })
  releaseDate?: string;

  @ApiPropertyOptional({ example: 'Live' })
  status?: string;

  @ApiPropertyOptional({ example: '723277809397' })
  upc?: string;

  @ApiPropertyOptional({ example: 'Gemini Chachi' })
  artistName?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}