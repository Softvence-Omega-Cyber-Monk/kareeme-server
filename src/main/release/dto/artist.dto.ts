import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';

export class CreateArtistDto {
  @ApiProperty({
    example: 'Gemini Chachi',
    description: 'Artist name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'artist@example.com',
    description: 'Artist email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Artist phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Stage name',
  })
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({
    example: 'Bio information',
    description: 'Artist biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Artist profile image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Spotify artist ID',
  })
  @IsOptional()
  @IsString()
  spotifyId?: string;

  @ApiPropertyOptional({
    example: 'apple:artist:123',
    description: 'Apple Music artist ID',
  })
  @IsOptional()
  @IsString()
  appleId?: string;
}

export class UpdateArtistDto {
  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Artist name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'artist@example.com',
    description: 'Artist email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Artist phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Gemini Chachi',
    description: 'Stage name',
  })
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({
    example: 'Bio information',
    description: 'Artist biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Artist profile image URL',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Spotify artist ID',
  })
  @IsOptional()
  @IsString()
  spotifyId?: string;

  @ApiPropertyOptional({
    example: 'apple:artist:123',
    description: 'Apple Music artist ID',
  })
  @IsOptional()
  @IsString()
  appleId?: string;
}

export class ArtistResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  artistId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'Gemini Chachi' })
  name: string;

  @ApiPropertyOptional({ example: 'artist@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Gemini Chachi' })
  stageName?: string;

  @ApiPropertyOptional({ example: 'Bio information' })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  spotifyId?: string;

  @ApiPropertyOptional({ example: 'apple:artist:123' })
  appleId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}