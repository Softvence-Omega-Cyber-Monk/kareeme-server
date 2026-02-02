import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

// Helper to parse JSON from FormData
const parseJSON = (value: any) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

// Helper to parse boolean from FormData
const parseBoolean = (value: any) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

// Helper to parse number from FormData
const parseNumber = (value: any) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
  return value;
};

// ========== Artist DTOs ==========
export class CreateArtistDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'artist@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://soundcloud.com/artist' })
  @IsOptional()
  @IsString()
  soundcloudProfile?: string;
}

// ========== Release Artist DTOs ==========
export class CreateReleaseArtistDto {
  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing artist ID (use this OR artist object)' 
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({ 
    description: 'New artist data as JSON string (use this OR artistId)',
    example: '{"name":"John Doe","email":"artist@example.com"}'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @ValidateNested()
  @Type(() => CreateArtistDto)
  artist?: CreateArtistDto;

  @ApiPropertyOptional({ example: 'Primary Artist' })
  @IsOptional()
  @IsString()
  role?: string;
}

// ========== Territory DTOs ==========
export class CreateReleaseTerritoryDto {
  @ApiProperty({ example: 'US' })
  @IsNotEmpty()
  @IsString()
  territory: string;
}

// ========== Label DTOs ==========
export class CreateLabelDto {
  @ApiPropertyOptional({ example: 'Universal Music' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Legal Attorney Name' })
  @IsOptional()
  @IsString()
  attorney?: string;
}

// ========== Contributor DTOs ==========
export class CreateContributorDto {
  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Songwriter' })
  @IsOptional()
  @IsString()
  contribution?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '456 Oak St, City, Country' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Sony/ATV Music Publishing' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ example: 'ASCAP' })
  @IsOptional()
  @IsString()
  affiliation?: string;

  @ApiPropertyOptional({ example: '00123456789' })
  @IsOptional()
  @IsString()
  ipiCaeNumber?: string;

  @ApiPropertyOptional({ example: 25.50 })
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  @IsDecimal()
  percentageSplit?: number;
}

// ========== Split Sheet Agreement DTOs ==========
export class CreateSplitSheetAgreementDto {
  @ApiPropertyOptional({ example: 'Beautiful Song' })
  @IsOptional()
  @IsString()
  songTitle?: string;

  @ApiPropertyOptional({ example: 'USRC17607839' })
  @IsOptional()
  @IsString()
  isrc?: string;

  @ApiPropertyOptional({ example: '2024-12-01' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing label ID (use this OR recordLabel object)' 
  })
  @IsOptional()
  @IsUUID()
  recordLabelId?: string;

  @ApiPropertyOptional({ 
    description: 'New label data as JSON string (use this OR recordLabelId)',
    example: '{"name":"Universal Music","attorney":"John Attorney"}'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @ValidateNested()
  @Type(() => CreateLabelDto)
  recordLabel?: CreateLabelDto;

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Contributors as JSON array string',
    example: '[{"fullName":"Jane Smith","contribution":"Songwriter"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContributorDto)
  contributors?: CreateContributorDto[];
}

// ========== Track Artist DTOs ==========
export class CreateTrackArtistDto {
  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing artist ID (use this OR artist object)' 
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({ 
    description: 'New artist data as JSON string (use this OR artistId)',
    example: '{"name":"John Doe","email":"artist@example.com"}'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @ValidateNested()
  @Type(() => CreateArtistDto)
  artist?: CreateArtistDto;

  @ApiPropertyOptional({ example: 'Client Name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ example: 'Artist Stage Name' })
  @IsOptional()
  @IsString()
  nameOnTrack?: string;

  @ApiPropertyOptional({ example: 'Featured' })
  @IsOptional()
  @IsString()
  artistType?: string;

  @ApiPropertyOptional({ example: 'Composer' })
  @IsOptional()
  @IsString()
  songwriterRole?: string;

  @ApiPropertyOptional({ example: 'John Real Name' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ example: '50%' })
  @IsOptional()
  @IsString()
  masterSplit?: string;

  @ApiPropertyOptional({ example: '7lsJSPe0qdc2WLNjT7x6Jb' })
  @IsOptional()
  @IsString()
  spotifyId?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  appleId?: string;
}

// ========== Track DTOs ==========
export class CreateTrackDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  @IsInt()
  trackNumber?: number;

  @ApiPropertyOptional({ example: 'Song Title' })
  @IsOptional()
  @IsString()
  trackTitle?: string;

  @ApiPropertyOptional({ example: 'Pop' })
  @IsOptional()
  @IsString()
  trackGenre?: string;

  @ApiPropertyOptional({ example: 'Radio Edit' })
  @IsOptional()
  @IsString()
  trackMix?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  explicitContent?: boolean;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  trackLanguage?: string;

  @ApiPropertyOptional({ example: 'Music Publisher Inc.' })
  @IsOptional()
  @IsString()
  trackPublisher?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  originalReleaseDate?: string;

  @ApiPropertyOptional({ example: 'USRC17607839' })
  @IsOptional()
  @IsString()
  trackIsrc?: string;

  @ApiPropertyOptional({ example: 'Worldwide except CN' })
  @IsOptional()
  @IsString()
  territoryRestrictions?: string;

  @ApiPropertyOptional({ 
    description: 'Index of the audio file in the files array (e.g., "0" for first file)',
    example: '0'
  })
  @IsOptional()
  @IsString()
  audioFileIndex?: string;

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Track artists as JSON array string',
    example: '[{"nameOnTrack":"John Doe","artistType":"Primary"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackArtistDto)
  trackArtists?: CreateTrackArtistDto[];
}

// ========== Back Catalogue DTOs ==========
export class CreateBackCatalogueDto {
  @ApiPropertyOptional({ example: 'Universal Records' })
  @IsOptional()
  @IsString()
  labelName?: string;

  @ApiPropertyOptional({ example: 'The Orchard' })
  @IsOptional()
  @IsString()
  distributor?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsString()
  upc?: string;

  @ApiPropertyOptional({ example: 'CAT-2024-001' })
  @IsOptional()
  @IsString()
  catalogueNumber?: string;

  @ApiPropertyOptional({ example: 'Artist Name' })
  @IsOptional()
  @IsString()
  releaseArtist?: string;

  @ApiPropertyOptional({ example: 'Album Title' })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({ example: 'Album' })
  @IsOptional()
  @IsString()
  releaseType?: string;

  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ example: 'ℙ 2024 Label Name' })
  @IsOptional()
  @IsString()
  releasePLine?: string;

  @ApiPropertyOptional({ example: '© 2024 Label Name' })
  @IsOptional()
  @IsString()
  releaseCLine?: string;
}

// ========== Main Release Form DTO (FormData) ==========
export class CreateReleaseFormDataDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID from authenticated user (will be overridden by JWT)' 
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: '2024-12-25' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ example: '2024-12-01' })
  @IsOptional()
  @IsDateString()
  preOrderDate?: string;

  @ApiPropertyOptional({ example: 'My Album Title' })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({ example: 'Album' })
  @IsOptional()
  @IsString()
  typeOfRelease?: string;

  @ApiPropertyOptional({ example: 'Pop' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'false' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  isExplicitContent?: boolean;

  @ApiPropertyOptional({ example: 'false' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  hasExternalRightsHolder?: boolean;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  hasDolbyAtmosVersion?: boolean;

  @ApiPropertyOptional({ example: 'false' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  hasExtendedMixForDjStores?: boolean;

  @ApiPropertyOptional({ example: 'Additional release details here' })
  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  hasArtistOnSpotify?: boolean;

  @ApiPropertyOptional({ example: 'false' })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  hasMusicVideo?: boolean;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Release artists as JSON array string',
    example: '[{"artistId":"836c0e3b-950c-415e-aafc-842011526da1","role":"Primary Artist"},{"artistId":"836c0e3b-950c-415e-aafc-842011526da1","role":"Secondary Artist"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseArtistDto)
  releaseArtists?: CreateReleaseArtistDto[];

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Release territories as JSON array string',
    example: '[{"territory":"US"},{"territory":"UK"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseTerritoryDto)
  releaseTerritories?: CreateReleaseTerritoryDto[];

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Split sheet agreements as JSON array string',
    example: '[{"songTitle":"Beautiful Song","isrc":"USRC17607839"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSplitSheetAgreementDto)
  splitSheetAgreements?: CreateSplitSheetAgreementDto[];

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Tracks as JSON array string',
    example: '[{"trackNumber":1,"trackTitle":"Song Title","audioFileIndex":"0"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackDto)
  tracks?: CreateTrackDto[];

  @ApiPropertyOptional({ 
    type: 'string',
    description: 'Back catalogue entries as JSON array string',
    example: '[{"labelName":"Universal Records","upc":"123456789012"}]'
  })
  @IsOptional()
  @Transform(({ value }) => parseJSON(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBackCatalogueDto)
  backCatalogue?: CreateBackCatalogueDto[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Audio files for tracks (max 20 files). Reference by index in track.audioFileIndex',
  })
  files?: Express.Multer.File[];
}