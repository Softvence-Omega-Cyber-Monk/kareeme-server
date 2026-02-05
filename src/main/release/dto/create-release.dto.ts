import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateReleaseArtistDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Artist ID (if using existing artist)',
  })
  @IsOptional()
  @IsUUID()
  artistId?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Artist name (required if artistId not provided - will auto-create artist)',
  })
  @ValidateIf((o) => !o.artistId)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'artist@example.com',
    description: 'Artist email (optional - used when auto-creating artist)',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Artist phone (optional - used when auto-creating artist)',
  })
  @IsOptional()
  @IsString()
  phone?: string;
  
  @ApiPropertyOptional({
    example: 'Dhaka Bangladesh',
    description: 'Artist address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Stage name (optional - used when auto-creating artist)',
  })
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Spotify ID (optional - used when auto-creating artist)',
  })
  @IsOptional()
  @IsString()
  spotifyId?: string;

  @ApiPropertyOptional({
    example: 'apple:artist:123',
    description: 'Apple Music ID (optional - used when auto-creating artist)',
  })
  @IsOptional()
  @IsString()
  appleId?: string;

  @ApiPropertyOptional({
    example: 'Primary Artist',
    description: 'Artist role in the release',
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class CreateReleaseTerritoryDto {
  @ApiProperty({
    example: 'US',
    description: 'Territory code',
  })
  @IsString()
  @IsNotEmpty()
  territory: string;
}

export class CreateReleaseDto {
  @ApiProperty({
    example: '2025-03-15',
    description: 'Release date',
  })
  @IsDateString()
  @IsNotEmpty()
  releaseDate: string;

  @ApiPropertyOptional({
    example: '2025-03-01',
    description: 'Pre-order date',
  })
  @IsOptional()
  @IsDateString()
  preOrderDate?: string;

  @ApiProperty({
    example: 'Midnight Reflections',
    description: 'Title of the release',
  })
  @IsString()
  @IsNotEmpty()
  releaseTitle: string;

  @ApiProperty({
    example: 'Producer Credits',
    description: '40%'
  })
  @IsString()
  @IsNotEmpty()
  producerCredits: string;

  
  @ApiProperty({
    example: 'Lyricist Credits',
    description: '30%'
  })
  @IsString()
  @IsNotEmpty()
  lyricistCredits: string;

  
  @ApiProperty({
    example: 'Master splits',
    description: '30%'
  })
  @IsString()
  @IsNotEmpty()
  masterSplits: string;

  
  @ApiProperty({
    example: 'Copyright Holder',
    description: 'Name of the copyright holder'
  })
  @IsString()
  @IsNotEmpty()
  copyrightHolder: string;

  @ApiProperty({
    example: 'Label Name',
    description: 'Name of the record label',
  })
  @IsString()
  @IsNotEmpty()
  labelName: string;

  
  @ApiProperty({
    example: 'Album Level Artist Name',
    description: 'Name of the album level artist'
  })
  @IsString()
  @IsNotEmpty()
  albumLevelArtistName: string;

  
  @ApiProperty({
    example: 'Link of music file',
    description: 'Link to the music file'
  })
  @IsString()
  @IsOptional()
  musicFileLink?: string;

  @ApiProperty({
    example: 'Single',
    description: 'Type of release (Single, Album, EP)',
    enum: ['Single', 'Album', 'EP'],
  })
  @IsString()
  @IsNotEmpty()
  typeOfRelease: string;

  @ApiPropertyOptional({
    example: 'Pop/R&B',
    description: 'Genre of the release',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Language of the release',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this release contain explicit content?',
  })
  @IsOptional()
  @IsBoolean()
  isExplicitContent?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this release have external rights holder?',
  })
  @IsOptional()
  @IsBoolean()
  hasExternalRightsHolder?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this release have a Dolby Atmos version?',
  })
  @IsOptional()
  @IsBoolean()
  hasDolbyAtmosVersion?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Does this release have an extended mix for DJ stores?',
  })
  @IsOptional()
  @IsBoolean()
  hasExtendedMixForDjStores?: boolean;

  @ApiPropertyOptional({
    example: 'Additional information about distribution',
    description: 'Any additional details about the release',
  })
  @IsOptional()
  @IsString()
  additionalDetails?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Do any artists involved already have music on Spotify?',
  })
  @IsOptional()
  @IsBoolean()
  hasArtistOnSpotify?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Will there be a music video with this release?',
  })
  @IsOptional()
  @IsBoolean()
  hasMusicVideo?: boolean;

  @ApiPropertyOptional({
    type: [CreateReleaseArtistDto],
    description: 'Artists associated with this release. Provide either artistId OR name to auto-create.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseArtistDto)
  artists?: CreateReleaseArtistDto[];

  @ApiPropertyOptional({
    type: [CreateReleaseTerritoryDto],
    description: 'Territories where the release will be available',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReleaseTerritoryDto)
  territories?: CreateReleaseTerritoryDto[];

  @ApiPropertyOptional({
    example: 'Draft',
    description: 'Status of the release',
  })
  @IsOptional()
  @IsString()
  status?: string;
}