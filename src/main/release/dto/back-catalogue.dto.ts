import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBackCatalogueDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Release ID this back catalogue entry belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  releaseId: string;

  @ApiPropertyOptional({
    example: 'OneIsOneEnt',
    description: 'Label name',
  })
  @IsOptional()
  @IsString()
  labelName?: string;

  @ApiPropertyOptional({
    example: 'Distrokid',
    description: 'Distributor name',
  })
  @IsOptional()
  @IsString()
  distributor?: string;

  @ApiPropertyOptional({
    example: '723277809397',
    description: 'UPC code',
  })
  @IsOptional()
  @IsString()
  upc?: string;

  @ApiPropertyOptional({
    example: 'ONELS-001',
    description: 'Catalogue number',
  })
  @IsOptional()
  @IsString()
  catalogueNumber?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Release artist',
  })
  @IsOptional()
  @IsString()
  releaseArtist?: string;

  @ApiPropertyOptional({
    example: 'The World is Yours (feat. LeeLee Babii)',
    description: 'Release title',
  })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({
    example: 'Single',
    description: 'Release type',
  })
  @IsOptional()
  @IsString()
  releaseType?: string;

  @ApiPropertyOptional({
    example: '2024-11-20',
    description: 'Release date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({
    example: '(P) 2024 OneIsOneEnt',
    description: 'P Line',
  })
  @IsOptional()
  @IsString()
  releasePLine?: string;

  @ApiPropertyOptional({
    example: '(c) 2024 OneIsOneEnt',
    description: 'C Line (Copyright)',
  })
  @IsOptional()
  @IsString()
  releaseCLine?: string;
}

export class UpdateBackCatalogueDto {
  @ApiPropertyOptional({
    example: 'OneIsOneEnt',
    description: 'Label name',
  })
  @IsOptional()
  @IsString()
  labelName?: string;

  @ApiPropertyOptional({
    example: 'Distrokid',
    description: 'Distributor name',
  })
  @IsOptional()
  @IsString()
  distributor?: string;

  @ApiPropertyOptional({
    example: '723277809397',
    description: 'UPC code',
  })
  @IsOptional()
  @IsString()
  upc?: string;

  @ApiPropertyOptional({
    example: 'ONELS-001',
    description: 'Catalogue number',
  })
  @IsOptional()
  @IsString()
  catalogueNumber?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Release artist',
  })
  @IsOptional()
  @IsString()
  releaseArtist?: string;

  @ApiPropertyOptional({
    example: 'The World is Yours (feat. LeeLee Babii)',
    description: 'Release title',
  })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({
    example: 'Single',
    description: 'Release type',
  })
  @IsOptional()
  @IsString()
  releaseType?: string;

  @ApiPropertyOptional({
    example: '2024-11-20',
    description: 'Release date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({
    example: '(P) 2024 OneIsOneEnt',
    description: 'P Line',
  })
  @IsOptional()
  @IsString()
  releasePLine?: string;

  @ApiPropertyOptional({
    example: '(c) 2024 OneIsOneEnt',
    description: 'C Line (Copyright)',
  })
  @IsOptional()
  @IsString()
  releaseCLine?: string;
}

export class BackCatalogueResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  catalogueId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  releaseId: string;

  @ApiPropertyOptional({ example: 'OneIsOneEnt' })
  labelName?: string;

  @ApiPropertyOptional({ example: 'Distrokid' })
  distributor?: string;

  @ApiPropertyOptional({ example: '723277809397' })
  upc?: string;

  @ApiPropertyOptional({ example: 'ONELS-001' })
  catalogueNumber?: string;

  @ApiPropertyOptional({ example: 'Gemini Chachi' })
  releaseArtist?: string;

  @ApiPropertyOptional({ example: 'The World is Yours (feat. LeeLee Babii)' })
  releaseTitle?: string;

  @ApiPropertyOptional({ example: 'Single' })
  releaseType?: string;

  @ApiPropertyOptional({ example: '2024-11-20' })
  releaseDate?: string;

  @ApiPropertyOptional({ example: '(P) 2024 OneIsOneEnt' })
  releasePLine?: string;

  @ApiPropertyOptional({ example: '(c) 2024 OneIsOneEnt' })
  releaseCLine?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}
