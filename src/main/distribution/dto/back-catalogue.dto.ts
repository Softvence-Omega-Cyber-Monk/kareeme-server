import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBackCatalogueDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User/Client ID',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'Darlene Robertson',
    description: 'Artist name',
  })
  @IsString()
  @IsNotEmpty()
  artistName: string;

  @ApiPropertyOptional({
    example: 'Hip Hop',
    description: 'Genre',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({
    example: 5,
    description: 'Total number of releases',
  })
  @IsInt()
  @IsNotEmpty()
  totalReleases: number;

  @ApiPropertyOptional({
    example: '3 Albums, 2 Single',
    description: 'Release type breakdown',
  })
  @IsOptional()
  @IsString()
  releaseTypes?: string;

  @ApiPropertyOptional({
    example: 'XYZ Distribution',
    description: 'Current distributor',
  })
  @IsOptional()
  @IsString()
  currentDistributor?: string;

  @ApiPropertyOptional({
    example: 'ABC Records',
    description: 'Label name',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    example: 25,
    description: 'Total number of tracks',
  })
  @IsInt()
  @IsNotEmpty()
  totalTracks: number;

  @ApiPropertyOptional({
    example: '2018-01-01',
    description: 'Date range start',
  })
  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Date range end',
  })
  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;
}

export class BackCatalogueResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  catalogueId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  distributorId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'Darlene Robertson' })
  artistName: string;

  @ApiPropertyOptional({ example: 'Hip Hop' })
  genre?: string;

  @ApiProperty({ example: 5 })
  totalReleases: number;

  @ApiPropertyOptional({ example: '3 Albums, 2 Single' })
  releaseTypes?: string;

  @ApiPropertyOptional({ example: 'XYZ Distribution' })
  currentDistributor?: string;

  @ApiPropertyOptional({ example: 'ABC Records' })
  label?: string;

  @ApiProperty({ example: 25 })
  totalTracks: number;

  @ApiPropertyOptional({ example: '2018-01-01' })
  dateRangeStart?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  dateRangeEnd?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
