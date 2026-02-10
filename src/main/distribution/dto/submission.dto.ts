import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SubmissionStatus {
  PendingReview = 'PendingReview',
  Approved = 'Approved',
  Declined = 'Declined',
}

export class SubmissionResponseDto {
  @ApiProperty()
  submissionId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  releaseId: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ enum: SubmissionStatus })
  status: SubmissionStatus;

  @ApiProperty()
  submissionDate: Date;

  @ApiProperty()
  user: any;

  @ApiProperty()
  release: any;

  @ApiProperty()
  createdAt: Date;
}

export class ApproveSubmissionDto {
  @ApiPropertyOptional({ example: 'Approved for distribution' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class DeclineSubmissionDto {
  @ApiProperty({ example: 'Missing required metadata' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
