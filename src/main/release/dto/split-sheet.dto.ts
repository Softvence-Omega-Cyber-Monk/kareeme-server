import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContributorDto {
  @ApiPropertyOptional({
    example: 'John Smith',
    description: 'Full name of the contributor',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    example: 'Composer',
    description: 'Contribution type',
  })
  @IsOptional()
  @IsString()
  contribution?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Music St, Los Angeles, CA 90001',
    description: 'Address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Universal Music Publishing',
    description: 'Publisher name',
  })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({
    example: 'ASCAP',
    description: 'PRO affiliation (ASCAP, BMI, SESAC, etc.)',
  })
  @IsOptional()
  @IsString()
  affiliation?: string;

  @ApiPropertyOptional({
    example: '00123456789',
    description: 'IPI/CAE number',
  })
  @IsOptional()
  @IsString()
  ipiCaeNumber?: string;

  @ApiProperty({
    example: 25.00,
    description: 'Percentage split (0-100)',
  })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  percentageSplit: number;
}

export class CreateSplitSheetDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Release ID this split sheet belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  releaseId: string;

  @ApiPropertyOptional({
    example: 'Midnight Reflections',
    description: 'Song title',
  })
  @IsOptional()
  @IsString()
  songTitle?: string;

  @ApiPropertyOptional({
    example: 'USRC17607839',
    description: 'ISRC code',
  })
  @IsOptional()
  @IsString()
  isrc?: string;

  @ApiPropertyOptional({
    example: '2025-03-15',
    description: 'Release date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Record label ID',
  })
  @IsOptional()
  @IsUUID()
  recordLabelId?: string;

  @ApiProperty({
    type: [CreateContributorDto],
    description: 'Contributors and their splits (must total 100%)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContributorDto)
  @IsNotEmpty()
  contributors: CreateContributorDto[];
}

export class UpdateSplitSheetDto {
  @ApiPropertyOptional({
    example: 'Midnight Reflections',
    description: 'Song title',
  })
  @IsOptional()
  @IsString()
  songTitle?: string;

  @ApiPropertyOptional({
    example: 'USRC17607839',
    description: 'ISRC code',
  })
  @IsOptional()
  @IsString()
  isrc?: string;

  @ApiPropertyOptional({
    example: '2025-03-15',
    description: 'Release date',
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Record label ID',
  })
  @IsOptional()
  @IsUUID()
  recordLabelId?: string;

  @ApiPropertyOptional({
    type: [CreateContributorDto],
    description: 'Contributors and their splits (must total 100%)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContributorDto)
  contributors?: CreateContributorDto[];
}

export class SplitSheetResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  splitId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  releaseId: string;

  @ApiPropertyOptional({ example: 'Midnight Reflections' })
  songTitle?: string;

  @ApiPropertyOptional({ example: 'USRC17607839' })
  isrc?: string;

  @ApiPropertyOptional({ example: '2025-03-15' })
  releaseDate?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recordLabelId?: string;

  @ApiPropertyOptional({
    example: [
      {
        contributorId: '123e4567-e89b-12d3-a456-426614174000',
        fullName: 'John Smith',
        contribution: 'Composer',
        percentageSplit: '25.00',
      },
    ],
  })
  contributors?: any[];

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}
