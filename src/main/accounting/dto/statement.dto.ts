import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum StatementStatus {
  Paid = 'Paid',
  PaymentRequired = 'PaymentRequired',
  PaymentSubmitted = 'PaymentSubmitted',
  PaymentNotRequired = 'PaymentNotRequired',
  Pending = 'Pending',
}

export class CreateStatementDto {
  @ApiProperty({
    example: 7,
    description: 'Statement month (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  statementMonth: number;

  @ApiProperty({
    example: 2025,
    description: 'Statement year',
  })
  @IsInt()
  @Min(2020)
  @IsNotEmpty()
  statementYear: number;

  @ApiProperty({
    example: '2025-07-01',
    description: 'Period start date',
  })
  @IsDateString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty({
    example: '2025-07-31',
    description: 'Period end date',
  })
  @IsDateString()
  @IsNotEmpty()
  periodEnd: string;

  @ApiPropertyOptional({
    example: '2025-07-24',
    description: 'Date statement was issued',
  })
  @IsOptional()
  @IsDateString()
  issuedOn?: string;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Opening balance',
  })
  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Total earnings for the period',
  })
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Total expenses for the period',
  })
  @IsOptional()
  @IsNumber()
  totalExpenses?: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Payment amount',
  })
  @IsOptional()
  @IsNumber()
  payment?: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Closing balance',
  })
  @IsOptional()
  @IsNumber()
  closingBalance?: number;

  @ApiPropertyOptional({
    enum: StatementStatus,
    example: StatementStatus.Pending,
    description: 'Statement status',
  })
  @IsOptional()
  @IsEnum(StatementStatus)
  status?: StatementStatus;

  @ApiPropertyOptional({
    example: 'Notes about this statement',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatementDto {
  @ApiPropertyOptional({
    example: '2025-08-11',
    description: 'Date statement was paid',
  })
  @IsOptional()
  @IsDateString()
  paidOn?: string;

  @ApiPropertyOptional({
    example: 100.0,
    description: 'Total earnings for the period',
  })
  @IsOptional()
  @IsNumber()
  totalEarnings?: number;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Total expenses for the period',
  })
  @IsOptional()
  @IsNumber()
  totalExpenses?: number;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Payment amount',
  })
  @IsOptional()
  @IsNumber()
  payment?: number;

  @ApiPropertyOptional({
    enum: StatementStatus,
    example: StatementStatus.Paid,
    description: 'Statement status',
  })
  @IsOptional()
  @IsEnum(StatementStatus)
  status?: StatementStatus;

  @ApiPropertyOptional({
    example: 'Payment processed',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class StatementResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  statementId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 7 })
  statementMonth: number;

  @ApiProperty({ example: 2025 })
  statementYear: number;

  @ApiProperty({ example: '2025-07-01' })
  periodStart: string;

  @ApiProperty({ example: '2025-07-31' })
  periodEnd: string;

  @ApiPropertyOptional({ example: '2025-07-24' })
  issuedOn?: string;

  @ApiPropertyOptional({ example: '2025-08-11' })
  paidOn?: string;

  @ApiProperty({ example: '0.00' })
  openingBalance: string;

  @ApiProperty({ example: '382.19' })
  totalEarnings: string;

  @ApiProperty({ example: '0.00' })
  totalExpenses: string;

  @ApiProperty({ example: '382.19' })
  payment: string;

  @ApiProperty({ example: '0.00' })
  closingBalance: string;

  @ApiProperty({ enum: StatementStatus, example: StatementStatus.Paid })
  status: StatementStatus;

  @ApiPropertyOptional({ example: 'Statement notes' })
  notes?: string;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  updatedAt: Date;
}

export class StatementListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  statementId: string;

  @ApiProperty({ example: 'Statement for July 2025' })
  title: string;

  @ApiProperty({ example: 'July 25 Statement' })
  subtitle: string;

  @ApiProperty({ enum: StatementStatus, example: StatementStatus.Paid })
  status: StatementStatus;

  @ApiProperty({ example: '8.00' })
  paymentAmount: string;

  @ApiProperty({ example: 7 })
  month: number;

  @ApiProperty({ example: 2025 })
  year: number;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  createdAt: Date;
}

export class StatementSummaryDto {
  @ApiProperty({ example: 2025 })
  year: number;

  @ApiProperty({ example: '999.27' })
  totalAmount: string;

  @ApiProperty({ example: 12 })
  statementCount: number;
}
