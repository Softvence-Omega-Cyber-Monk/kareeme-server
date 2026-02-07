import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Platform } from './platform.dto';

export class CreateAssetDto {
  @ApiProperty({
    example: 'Women Dominated Cypher 2021 (Official Cypher)',
    description: 'Asset title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Auntie House',
    description: 'Artist name',
  })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiProperty({
    enum: Platform,
    example: Platform.YouTube,
    description: 'Platform name',
  })
  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @ApiPropertyOptional({
    example: 'Video',
    description: 'Asset type (Video, Audio)',
  })
  @IsOptional()
  @IsString()
  assetType?: string;

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
    example: 2502,
    description: 'Total views',
  })
  @IsOptional()
  @IsInt()
  totalViews?: number;

  @ApiPropertyOptional({
    example: 5.93,
    description: 'Ad supported earnings',
  })
  @IsOptional()
  @IsNumber()
  adSupported?: number;

  @ApiPropertyOptional({
    example: 2.07,
    description: 'YouTube Premium earnings',
  })
  @IsOptional()
  @IsNumber()
  youtubePremium?: number;

  @ApiPropertyOptional({
    example: 8.00,
    description: 'Total earnings',
  })
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Related release ID',
  })
  @IsOptional()
  @IsUUID()
  releaseId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Related track ID',
  })
  @IsOptional()
  @IsUUID()
  trackId?: string;
}

export class AssetResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  assetId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'Women Dominated Cypher 2021 (Official Cypher)' })
  title: string;

  @ApiProperty({ example: 'Auntie House' })
  artist: string;

  @ApiProperty({ enum: Platform, example: Platform.YouTube })
  platform: Platform;

  @ApiPropertyOptional({ example: 'Video' })
  assetType?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: '2021-09-26' })
  publishedDate?: string;

  @ApiProperty({ example: 2502 })
  totalViews: number;

  @ApiProperty({ example: '$5.93 USD' })
  adSupported: string;

  @ApiProperty({ example: '$2.07 USD' })
  youtubePremium: string;

  @ApiProperty({ example: '$8.00 USD' })
  totalEarnings: string;

  @ApiProperty({ example: '2024-07-15T10:30:00Z' })
  createdAt: Date;
}
