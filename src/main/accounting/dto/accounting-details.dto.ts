import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ========== Deal Status DTOs ==========
export class CreateDealStatusDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statement ID',
  })
  @IsUUID()
  @IsNotEmpty()
  statementId: string;

  @ApiProperty({
    example: 'K Shiday - Trickin',
    description: 'Account/deal name',
  })
  @IsString()
  @IsNotEmpty()
  account: string;

  @ApiPropertyOptional({
    example: 'K Shiday',
    description: 'Artist name',
  })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional({
    example: 'Trickin',
    description: 'Release title',
  })
  @IsOptional()
  @IsString()
  releaseTitle?: string;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Opening balance',
  })
  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @ApiPropertyOptional({
    example: 2502.00,
    description: 'Earnings for this deal',
  })
  @IsOptional()
  @IsNumber()
  earnings?: number;

  @ApiPropertyOptional({
    example: 0.0,
    description: 'Expenses for this deal',
  })
  @IsOptional()
  @IsNumber()
  expenses?: number;

  @ApiPropertyOptional({
    example: 2502.00,
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
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Related release ID',
  })
  @IsOptional()
  @IsUUID()
  releaseId?: string;
}

export class DealStatusResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  dealStatusId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  statementId: string;

  @ApiProperty({ example: 'K Shiday - Trickin' })
  account: string;

  @ApiPropertyOptional({ example: 'K Shiday' })
  artistName?: string;

  @ApiPropertyOptional({ example: 'Trickin' })
  releaseTitle?: string;

  @ApiProperty({ example: '0.00' })
  openingBalance: string;

  @ApiProperty({ example: '2502.00' })
  earnings: string;

  @ApiProperty({ example: '0.00' })
  expenses: string;

  @ApiProperty({ example: '2502.00' })
  payment: string;

  @ApiProperty({ example: '0.00' })
  closingBalance: string;

  @ApiProperty({ example: '2024-07-24T10:30:00Z' })
  createdAt: Date;
}

// ========== Statement Release DTOs ==========
export class CreateStatementReleaseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statement ID',
  })
  @IsUUID()
  @IsNotEmpty()
  statementId: string;

  @ApiProperty({
    example: 'Trickin',
    description: 'Release title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'K Shiday',
    description: 'Artist name',
  })
  @IsString()
  @IsNotEmpty()
  artist: string;

  @ApiPropertyOptional({
    example: '723277809397',
    description: 'UPC code',
  })
  @IsOptional()
  @IsString()
  upc?: string;

  @ApiPropertyOptional({
    example: 'QZTGW2400453',
    description: 'ISRC code',
  })
  @IsOptional()
  @IsString()
  isrc?: string;

  @ApiPropertyOptional({
    example: '7529095',
    description: 'Asset ID',
  })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({
    example: 'Art Track',
    description: 'Asset type',
  })
  @IsOptional()
  @IsString()
  assetType?: string;

  @ApiProperty({
    example: 206.62,
    description: 'Amount earned',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Link to actual release',
  })
  @IsOptional()
  @IsUUID()
  releaseId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Link to actual track',
  })
  @IsOptional()
  @IsUUID()
  trackId?: string;
}

// ========== Statement Territory DTOs ==========
export class CreateStatementTerritoryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statement ID',
  })
  @IsUUID()
  @IsNotEmpty()
  statementId: string;

  @ApiProperty({
    example: 'United States',
    description: 'Country name',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: 206.62,
    description: 'Amount from this territory',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

// ========== Statement Platform DTOs ==========
export class CreateStatementPlatformDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Statement ID',
  })
  @IsUUID()
  @IsNotEmpty()
  statementId: string;

  @ApiProperty({
    example: 'YouTube',
    description: 'Platform name',
  })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({
    example: 206.62,
    description: 'Amount from this platform',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

// ========== Profit & Loss DTOs ==========
export class ProfitLossResponseDto {
  @ApiProperty({ example: 2025 })
  year: number;

  @ApiProperty({ example: '1061.16' })
  totalIncome: string;

  @ApiProperty({ example: '27183.94' })
  totalExpenses: string;

  @ApiProperty({ example: '-26122.78' })
  netProfitLoss: string;

  @ApiProperty({
    example: [
      { date: '2025-01-01', income: 100, expenses: 50 },
      { date: '2025-01-02', income: 150, expenses: 75 },
    ],
  })
  monthlyData: Array<{
    date: string;
    income: number;
    expenses: number;
  }>;

  @ApiProperty({
    example: [
      { source: 'August 2024 Royalties', amount: '2502.00', date: '2024-08-15' },
    ],
  })
  incomeTransactions: Array<{
    source: string;
    amount: string;
    date: string;
  }>;

  @ApiProperty({
    example: [
      { source: 'Atlanta Studio Session', amount: '3300.00', date: '2024-10-03' },
    ],
  })
  expenseTransactions: Array<{
    source: string;
    amount: string;
    date: string;
  }>;
}

// ========== Statement Details DTOs ==========
export class StatementDetailsDto {
  @ApiProperty({ type: () => Object })
  statement: any;

  @ApiProperty({ type: [Object] })
  releases: any[];

  @ApiProperty({ type: [Object] })
  tracks: any[];

  @ApiProperty({ type: [Object] })
  assets: any[];

  @ApiProperty({ type: [Object] })
  platforms: any[];

  @ApiProperty({ type: [Object] })
  territories: any[];

  @ApiProperty({ type: [Object] })
  dealStatuses: any[];
}
