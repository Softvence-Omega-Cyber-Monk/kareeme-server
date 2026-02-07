import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Platform } from './platform.dto';

// ========== Geo Trend DTOs ==========
export class CreateGeoTrendDto {
  @ApiProperty({
    enum: Platform,
    example: Platform.YouTube,
    description: 'Platform name',
  })
  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @ApiProperty({
    example: 'United States',
    description: 'Country name',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    example: 'Ohio',
    description: 'Region/state name (for US)',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    example: '2024-07-15',
    description: 'Date',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    example: 2502,
    description: 'Views from this location',
  })
  @IsOptional()
  @IsInt()
  views?: number;

  @ApiPropertyOptional({
    example: 8.00,
    description: 'Earnings from this location',
  })
  @IsOptional()
  @IsNumber()
  earnings?: number;
}

export class GeoTrendResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  geoTrendId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ enum: Platform, example: Platform.YouTube })
  platform: Platform;

  @ApiProperty({ example: 'United States' })
  country: string;

  @ApiPropertyOptional({ example: 'Ohio' })
  region?: string;

  @ApiProperty({ example: '2024-07-15' })
  date: string;

  @ApiProperty({ example: 7 })
  month: number;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ example: 2502 })
  views: number;

  @ApiProperty({ example: '$8.00 USD' })
  earnings: string;

  @ApiProperty({ example: '2024-07-15T10:30:00Z' })
  createdAt: Date;
}

// ========== Claim DTOs ==========
export enum ClaimStatus {
  Active = 'Active',
  Pending = 'Pending',
  Resolved = 'Resolved',
  Disputed = 'Disputed',
  Rejected = 'Rejected',
}

export class CreateClaimDto {
  @ApiProperty({
    example: 'Women Dominated Cypher 2021 (Official Cypher)',
    description: 'Claim title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Third Party Claimant',
    description: 'Who made the claim',
  })
  @IsOptional()
  @IsString()
  claimant?: string;

  @ApiProperty({
    enum: Platform,
    example: Platform.YouTube,
    description: 'Platform name',
  })
  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @ApiPropertyOptional({
    enum: ClaimStatus,
    example: ClaimStatus.Active,
    description: 'Claim status',
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnail.jpg',
    description: 'Thumbnail URL',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: '2021-09-26',
    description: 'Published date',
  })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @ApiPropertyOptional({
    example: 'Copyright claim description',
    description: 'Claim description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Views affected by claim',
  })
  @IsOptional()
  @IsInt()
  views?: number;

  @ApiPropertyOptional({
    example: 0.05,
    description: 'Ad supported earnings',
  })
  @IsOptional()
  @IsNumber()
  adSupported?: number;

  @ApiPropertyOptional({
    example: 0.04,
    description: 'YouTube Premium earnings',
  })
  @IsOptional()
  @IsNumber()
  youtubePremium?: number;

  @ApiPropertyOptional({
    example: 0.09,
    description: 'Total earnings from claim',
  })
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @ApiPropertyOptional({
    example: '2024-07-15',
    description: 'Claim date',
  })
  @IsOptional()
  @IsDateString()
  claimedDate?: string;
}

export class UpdateClaimDto {
  @ApiPropertyOptional({
    enum: ClaimStatus,
    example: ClaimStatus.Resolved,
    description: 'Claim status',
  })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiPropertyOptional({
    example: '2024-08-15',
    description: 'Resolution date',
  })
  @IsOptional()
  @IsDateString()
  resolvedDate?: string;

  @ApiPropertyOptional({
    example: 'Resolved in our favor',
    description: 'Description update',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ClaimResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  claimId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'Women Dominated Cypher 2021 (Official Cypher)' })
  title: string;

  @ApiPropertyOptional({ example: 'Third Party Claimant' })
  claimant?: string;

  @ApiProperty({ enum: Platform, example: Platform.YouTube })
  platform: Platform;

  @ApiProperty({ enum: ClaimStatus, example: ClaimStatus.Active })
  status: ClaimStatus;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: '2021-09-26' })
  publishedDate?: string;

  @ApiPropertyOptional({ example: 'Copyright claim description' })
  description?: string;

  @ApiProperty({ example: 100 })
  views: number;

  @ApiProperty({ example: '$0.05 USD' })
  adSupported: string;

  @ApiProperty({ example: '$0.04 USD' })
  youtubePremium: string;

  @ApiProperty({ example: '$0.09 USD' })
  totalEarnings: string;

  @ApiPropertyOptional({ example: '2024-07-15' })
  claimedDate?: string;

  @ApiPropertyOptional({ example: '2024-08-15' })
  resolvedDate?: string;

  @ApiProperty({ example: '2024-07-15T10:30:00Z' })
  createdAt: Date;
}
