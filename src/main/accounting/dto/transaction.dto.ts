import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense',
  Payment = 'Payment',
  Refund = 'Refund',
  Adjustment = 'Adjustment',
}

export class CreateTransactionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statement ID this transaction belongs to',
  })
  @IsUUID()
  @IsNotEmpty()
  statementId: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.Income,
    description: 'Type of transaction',
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiPropertyOptional({
    example: 'August 2024 Royalties',
    description: 'Source of the transaction',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: 'Royalties from Spotify streams',
    description: 'Detailed description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 2502.00,
    description: 'Transaction amount',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: '2024-08-15',
    description: 'Transaction date',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

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

  @ApiPropertyOptional({
    example: { platform: 'Spotify', territory: 'US' },
    description: 'Additional metadata',
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    enum: TransactionType,
    example: TransactionType.Income,
    description: 'Type of transaction',
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: 'August 2024 Royalties',
    description: 'Source of the transaction',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: 'Updated description',
    description: 'Detailed description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 2502.00,
    description: 'Transaction amount',
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    example: '2024-08-15',
    description: 'Transaction date',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class TransactionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  transactionId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  statementId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.Income })
  type: TransactionType;

  @ApiPropertyOptional({ example: 'August 2024 Royalties' })
  source?: string;

  @ApiPropertyOptional({ example: 'Royalties from Spotify' })
  description?: string;

  @ApiProperty({ example: '2502.00' })
  amount: string;

  @ApiProperty({ example: '2024-08-15' })
  date: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  releaseId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  trackId?: string;

  @ApiPropertyOptional({ example: { platform: 'Spotify' } })
  metadata?: any;

  @ApiProperty({ example: '2024-08-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-15T10:30:00Z' })
  updatedAt: Date;
}
