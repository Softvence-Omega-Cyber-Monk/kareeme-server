import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum PaymentStatus {
  Pending = 'Pending',
  Submitted = 'Submitted',
  Paid = 'Paid',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export class CreatePaymentRequestDto {
  @ApiProperty({
    example: 2349.00,
    description: 'Amount to request for payment',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'Bank Transfer',
    description: 'Payment method (Bank Transfer, PayPal, etc.)',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: { bankName: 'Chase', accountNumber: '****1234' },
    description: 'Payment details',
  })
  @IsOptional()
  paymentDetails?: any;

  @ApiPropertyOptional({
    example: 'Payment for July 2025 statement',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentRequestDto {
  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.Paid,
    description: 'Payment status',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    example: 'TXN123456',
    description: 'Transaction reference',
  })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional({
    example: 'Payment processed successfully',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentRequestResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  paymentRequestId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '2349.00' })
  amount: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.Pending })
  status: PaymentStatus;

  @ApiPropertyOptional({ example: 'Bank Transfer' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: { bankName: 'Chase' } })
  paymentDetails?: any;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  requestedAt: Date;

  @ApiPropertyOptional({ example: '2025-07-25T10:30:00Z' })
  processedAt?: Date;

  @ApiPropertyOptional({ example: '2025-07-26T10:30:00Z' })
  paidAt?: Date;

  @ApiPropertyOptional({ example: 'TXN123456' })
  transactionRef?: string;

  @ApiPropertyOptional({ example: 'Payment notes' })
  notes?: string;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-07-24T10:30:00Z' })
  updatedAt: Date;
}
