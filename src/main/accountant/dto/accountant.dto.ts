import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// ========== Settings DTOs ==========
export class UpdateAccountantSettingsDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 'Stripe' })
  @IsOptional()
  @IsString()
  paymentGateway?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}

export class AccountantSettingsResponseDto {
  @ApiProperty()
  settingsId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  profilePhoto?: string;

  @ApiProperty()
  defaultCurrency: string;

  @ApiProperty()
  paymentGateway: string;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

// ========== Dashboard DTOs ==========
export class PlatformEarningDto {
  @ApiProperty()
  platform: string;

  @ApiProperty()
  amount: string;
}

export class EarningsBreakdownDto {
  @ApiProperty()
  platform: string;

  @ApiProperty()
  grossEarnings: string;

  @ApiProperty()
  commission: string;

  @ApiProperty()
  netEarnings: string;
}

export class AccountingDashboardDto {
  @ApiProperty()
  totalEarnings: string;

  @ApiProperty()
  platformCommission: string;

  @ApiProperty()
  netEarnings: string;

  @ApiProperty({ type: [EarningsBreakdownDto] })
  earningsBreakdown: EarningsBreakdownDto[];

  @ApiProperty()
  pendingPaymentAmount: string;
}

// ========== Payments & Earnings DTOs ==========
export class PendingPaymentDto {
  @ApiProperty()
  paymentId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  status: string;
}

export class PaymentHistoryDto {
  @ApiProperty()
  historyId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  method: string;
}

export class PaymentsEarningsDto {
  @ApiProperty()
  totalPlatformEarnings: string;

  @ApiProperty({ type: [PlatformEarningDto] })
  earningsOverview: PlatformEarningDto[];

  @ApiProperty({ type: [PendingPaymentDto] })
  pendingPayments: PendingPaymentDto[];

  @ApiProperty({ type: [PaymentHistoryDto] })
  paymentHistory: PaymentHistoryDto[];
}

// ========== Profit & Loss DTOs ==========
export class MonthlyIncomeExpenseDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  income: number;

  @ApiProperty()
  expense: number;
}

export class ClientProfitLossDto {
  @ApiProperty()
  clientName: string;

  @ApiProperty()
  income: string;

  @ApiProperty()
  expenses: string;
}

export class ProfitLossDto {
  @ApiProperty({ type: [MonthlyIncomeExpenseDto] })
  monthlyData: MonthlyIncomeExpenseDto[];

  @ApiProperty({ type: [ClientProfitLossDto] })
  clientData: ClientProfitLossDto[];
}

// ========== Client Management DTOs ==========
export class ClientManagementDto {
  @ApiProperty()
  clientFinId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  totalEarning: string;

  @ApiProperty()
  pendingPayment: string;

  @ApiProperty()
  lastPaymentDate: Date;
}

// ========== Statements DTOs ==========
export enum PaymentStatus {
  Paid = 'Paid',
  PaymentRequired = 'PaymentRequired',
  PaymentNotRequired = 'PaymentNotRequired',
  PaymentSubmitted = 'PaymentSubmitted',
}

export class MonthlyStatementDto {
  @ApiProperty()
  statementId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subtitle: string;

  @ApiProperty()
  amount: string;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty()
  month: number;

  @ApiProperty()
  year: number;

  @ApiPropertyOptional()
  fileUrl?: string;
}

export class YearStatementDto {
  @ApiProperty()
  year: number;

  @ApiProperty()
  totalAmount: string;

  @ApiProperty({ type: [MonthlyStatementDto] })
  statements: MonthlyStatementDto[];
}

// ========== Proceed Payment DTO ==========
export class ProceedPaymentDto {
  @ApiProperty({ example: 'payment-id-123' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiPropertyOptional({ example: 'Paypal' })
  @IsOptional()
  @IsString()
  method?: string;
}
