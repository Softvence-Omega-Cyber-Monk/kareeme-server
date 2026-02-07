import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export enum Platform {
  YouTube = 'YouTube',
  Spotify = 'Spotify',
  AppleMusic = 'AppleMusic',
  SoundCloud = 'SoundCloud',
  Audiomack = 'Audiomack',
  Deezer = 'Deezer',
  TIDAL = 'TIDAL',
  iHeartRadio = 'iHeartRadio',
}

export class CreatePlatformAnalyticsDto {
  @ApiProperty({
    enum: Platform,
    example: Platform.YouTube,
    description: 'Platform name',
  })
  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @ApiProperty({
    example: '2024-07-15',
    description: 'Date for analytics',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    example: 3800,
    description: 'Total views',
  })
  @IsOptional()
  @IsInt()
  totalViews?: number;

  @ApiPropertyOptional({
    example: 7.50,
    description: 'Total earnings',
  })
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @ApiPropertyOptional({
    example: 5.33,
    description: 'Free tier earnings',
  })
  @IsOptional()
  @IsNumber()
  freeEarnings?: number;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Free tier views',
  })
  @IsOptional()
  @IsInt()
  freeViews?: number;

  @ApiPropertyOptional({
    example: 2.00,
    description: 'Premium earnings',
  })
  @IsOptional()
  @IsNumber()
  premiumEarnings?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Premium views',
  })
  @IsOptional()
  @IsInt()
  premiumViews?: number;
}

export class PlatformAnalyticsResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  analyticsId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ enum: Platform, example: Platform.YouTube })
  platform: Platform;

  @ApiProperty({ example: '2024-07-15' })
  date: string;

  @ApiProperty({ example: 7 })
  month: number;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiProperty({ example: 3800 })
  totalViews: number;

  @ApiProperty({ example: '7.50' })
  totalEarnings: string;

  @ApiProperty({ example: '5.33' })
  freeEarnings: string;

  @ApiProperty({ example: 3000 })
  freeViews: number;

  @ApiProperty({ example: '2.00' })
  premiumEarnings: string;

  @ApiProperty({ example: 1000 })
  premiumViews: number;

  @ApiProperty({ example: '2024-07-15T10:30:00Z' })
  createdAt: Date;
}

export class PlatformOverviewDto {
  @ApiProperty({ enum: Platform, example: Platform.YouTube })
  platform: Platform;

  @ApiProperty({ example: '3.8k' })
  totalViews: string;

  @ApiProperty({ example: '$7.50 USD' })
  totalEarnings: string;

  @ApiProperty({
    example: {
      free: { earnings: '$5.33', views: '3k', percentage: 70 },
      premium: { earnings: '$2.00', views: '1k', percentage: 30 },
    },
  })
  earningsByType: {
    free: { earnings: string; views: string; percentage: number };
    premium: { earnings: string; views: string; percentage: number };
  };

  @ApiProperty({
    example: [
      { month: 'Jan', views: 547, earnings: 0.65 },
      { month: 'Feb', views: 632, earnings: 0.75 },
    ],
  })
  estimatedEarnings: Array<{ month: string; views: number; earnings: number }>;

  @ApiProperty({
    example: [
      { country: 'United States', earnings: '$8.18 USD' },
      { country: 'Australia', earnings: '$0.12 USD' },
    ],
  })
  topCountries: Array<{ country: string; earnings: string }>;

  @ApiProperty({
    example: [
      { region: 'Ohio', views: 250 },
      { region: 'Michigan', views: 300 },
    ],
  })
  topUSRegions: Array<{ region: string; views: number }>;

  @ApiProperty({
    example: [
      { title: 'Women Dominated Cypher 2021', earnings: '$8.00 USD' },
      { title: 'Active', earnings: '$0.09 USD' },
    ],
  })
  topAssets: Array<{ title: string; earnings: string }>;

  @ApiProperty({
    example: [
      { title: 'Women Dominated Cypher 2021', earnings: '$8.00 USD' },
    ],
  })
  topClaims: Array<{ title: string; earnings: string }>;
}
