import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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
    description: 'Existing artist ID (use this OR artist object)',
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({
    description: 'New artist data (use this OR artistId)',
    type: CreateArtistDto,
  })
  @IsOptional()
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

  @ApiPropertyOptional({ example: 25.5, description: 'Percentage split (0-100)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
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
    description: 'Existing label ID (use this OR recordLabel object)',
  })
  @IsOptional()
  @IsUUID()
  recordLabelId?: string;

  @ApiPropertyOptional({
    description: 'New label data (use this OR recordLabelId)',
    type: CreateLabelDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLabelDto)
  recordLabel?: CreateLabelDto;

  @ApiPropertyOptional({
    type: [CreateContributorDto],
    description: 'Array of contributors for this split sheet',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContributorDto)
  contributors?: CreateContributorDto[];
}

// ========== Track Artist DTOs ==========
export class CreateTrackArtistDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Existing artist ID (use this OR artist object)',
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({
    description: 'New artist data (use this OR artistId)',
    type: CreateArtistDto,
  })
  @IsOptional()
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
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  trackNumber: number;

  @ApiProperty({ example: 'Song Title' })
  @IsNotEmpty()
  @IsString()
  trackTitle: string;

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
    example: '0',
  })
  @IsOptional()
  @IsString()
  audioFileIndex?: string;

  @ApiPropertyOptional({
    type: [CreateTrackArtistDto],
    description: 'Array of artists for this track',
  })
  @IsOptional()
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

  @ApiPropertyOptional({ example: '℗ 2024 Label Name' })
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
    description: 'User ID from authenticated user (will be overridden by JWT)',
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ 
    example: '2024-12-25',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-01',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  preOrderDate?: string;

  @ApiPropertyOptional({ 
    example: 'My Album Title',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({ 
    example: 'Album',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  typeOfRelease?: string;

  @ApiPropertyOptional({ 
    example: 'Pop',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ 
    example: 'English',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ 
    example: 'false',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  isExplicitContent?: boolean;

  @ApiPropertyOptional({ 
    example: 'false',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  hasExternalRightsHolder?: boolean;

  @ApiPropertyOptional({ 
    example: 'true',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  hasDolbyAtmosVersion?: boolean;

  @ApiPropertyOptional({ 
    example: 'false',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  hasExtendedMixForDjStores?: boolean;

  @ApiPropertyOptional({ 
    example: 'Additional release details here',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @ApiPropertyOptional({ 
    example: 'true',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  hasArtistOnSpotify?: boolean;

  @ApiPropertyOptional({ 
    example: 'false',
    type: 'string',
    description: 'Boolean as string: "true" or "false"',
  })
  @IsOptional()
  @IsBoolean()
  hasMusicVideo?: boolean;

  @ApiPropertyOptional({ 
    example: 'PENDING',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    type: [CreateReleaseArtistDto],
    description: 'Release artists as array of objects. Example: [{"artistId":"uuid","role":"Primary Artist"}]',
    example: [{ artistId: '836c0e3b-950c-415e-aafc-842011526da1', role: 'Primary Artist' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseArtistDto)
  releaseArtists?: CreateReleaseArtistDto[];

  @ApiPropertyOptional({
    type: [CreateReleaseTerritoryDto],
    description: 'Release territories as array of objects. Example: [{"territory":"US"}]',
    example: [{ territory: 'US' }, { territory: 'UK' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseTerritoryDto)
  releaseTerritories?: CreateReleaseTerritoryDto[];

  @ApiPropertyOptional({
    type: [CreateSplitSheetAgreementDto],
    description: 'Split sheet agreements as array of objects. Example: [{"songTitle":"Song","isrc":"USRC17607839"}]',
    example: [{ songTitle: 'Beautiful Song', isrc: 'USRC17607839' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSplitSheetAgreementDto)
  splitSheetAgreements?: CreateSplitSheetAgreementDto[];

  @ApiPropertyOptional({
    type: [CreateTrackDto],
    description: 'Tracks as array of objects. Reference files by index in audioFileIndex. Example: [{"trackNumber":1,"trackTitle":"Song","audioFileIndex":"0"}]',
    example: [{ trackNumber: 1, trackTitle: 'My Song', audioFileIndex: '0' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackDto)
  tracks?: CreateTrackDto[];

  @ApiPropertyOptional({
    type: [CreateBackCatalogueDto],
    description: 'Back catalogue entries as array of objects. Example: [{"labelName":"Universal","upc":"123456789012"}]',
    example: [{ labelName: 'Universal Records', upc: '123456789012' }],
  })
  @IsOptional()
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
    description: 'Audio files for tracks (max 20 files, max 100MB each). Reference these files by their array index (0, 1, 2...) in the track.audioFileIndex field.',
  })
  files?: Express.Multer.File[];
}