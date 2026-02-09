import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum DistributionStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Distributed = 'Distributed',
  Failed = 'Failed',
  Declined = 'Declined',
}

export class CreateDistributionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  releaseId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: ['YouTube', 'Spotify', 'AppleMusic'] })
  @IsOptional()
  @IsArray()
  platforms?: string[];
}

export class UpdateDistributionDto {
  @ApiPropertyOptional({ enum: DistributionStatus })
  @IsOptional()
  @IsEnum(DistributionStatus)
  status?: DistributionStatus;

  @ApiPropertyOptional({ example: '2024-08-15' })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiPropertyOptional({ example: '2024-08-16' })
  @IsOptional()
  @IsDateString()
  distributedAt?: string;

  @ApiPropertyOptional({ example: '2024-08-17' })
  @IsOptional()
  @IsDateString()
  declinedAt?: string;
}

export class DistributionResponseDto {
  @ApiProperty()
  distributionId: string;

  @ApiProperty()
  releaseId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  distributorId: string;

  @ApiProperty({ enum: DistributionStatus })
  status: DistributionStatus;

  @ApiProperty()
  submittedAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  distributedAt?: Date;

  @ApiProperty()
  release: any;

  @ApiProperty({ type: [Object] })
  platformStatuses: any[];

  @ApiProperty({ type: [Object] })
  notes: any[];

  @ApiProperty()
  createdAt: Date;
}

export class AddDistributionNoteDto {
  @ApiProperty({ example: 'Distribution note content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isInternal?: boolean;
}

export class DashboardStatsDto {
  @ApiProperty({ example: 12 })
  submissionsToReview: number;

  @ApiProperty({ example: 7 })
  releasesToDistribute: number;

  @ApiProperty({ example: 3 })
  newClients: number;

  @ApiProperty({ example: 45 })
  liveReleases: number;

  @ApiProperty({ type: [Object] })
  recentActivity: Array<{
    title: string;
    subtitle: string;
    timestamp: string;
  }>;

  @ApiProperty({ type: Object })
  distributionStatus: {
    completed: number;
    inProgress: number;
    failed: number;
  };

  @ApiProperty({ type: [Object] })
  platformPerformance: Array<{
    platform: string;
    streams: string;
  }>;
}
