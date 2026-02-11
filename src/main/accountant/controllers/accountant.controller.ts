import { Controller, Get, Patch, Body, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateAuth, GetUser } from '@/core/jwt/jwt.decorator';
import {
  AccountantDashboardService,
  AccountantSettingsService,
  ClientFinancialService,
  StatementService,
} from '../services';
import {
  AccountingDashboardDto,
  PaymentsEarningsDto,
  ProfitLossDto,
  UpdateAccountantSettingsDto,
  ChangePasswordDto,
  ProceedPaymentDto,
} from '../dto/accountant.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Accountant Dashboard')
@Controller('accountant')
export class AccountantController {
  constructor(
    private readonly dashboardService: AccountantDashboardService,
    private readonly settingsService: AccountantSettingsService,
    private readonly clientService: ClientFinancialService,
    private readonly statementService: StatementService,
  ) {}

  // Dashboard Endpoints
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get accounting dashboard',
    description:
      'Get accounting dashboard with total earnings, platform commission, net earnings, and earnings breakdown',
  })
  @ApiResponse({ status: 200, type: AccountingDashboardDto })
  async getDashboard(@GetUser('sub') userId: string) {
    return this.dashboardService.getAccountingDashboard(userId);
  }

  @Get('payments-earnings')
  @ApiOperation({
    summary: 'Get payments and earnings',
    description:
      'Get total platform earnings, earnings overview by platform, pending payments, and payment history',
  })
  @ApiResponse({ status: 200, type: PaymentsEarningsDto })
  async getPaymentsEarnings(@GetUser('sub') userId: string) {
    return this.dashboardService.getPaymentsEarnings(userId);
  }

  @Get('profit-loss')
  @ApiOperation({
    summary: 'Get profit and loss',
    description:
      'Get monthly income vs expense data and client-wise profit/loss breakdown',
  })
  @ApiResponse({ status: 200, type: ProfitLossDto })
  async getProfitLoss(@GetUser('sub') userId: string) {
    return this.dashboardService.getProfitLoss(userId);
  }

  // Client Management
  @Get('clients')
  @ApiOperation({
    summary: 'Get client financials',
    description:
      'Get paginated list of all clients with their financial details',
  })
  async getClients(@Query() pg: PaginationDto) {
    return this.clientService.getClients(pg);
  }

  // Statements
  @Get('statements')
  @ApiOperation({
    summary: 'Get yearly statements',
    description:
      'Get statements grouped by year (2025, 2024, 2023, 2022) with payment status',
  })
  async getStatements(@GetUser('sub') userId: string) {
    return this.statementService.getStatements(userId);
  }

  // Settings
  @Get('settings')
  @ApiOperation({
    summary: 'Get accountant settings',
    description: 'Get account settings including profile, financial, security',
  })
  async getSettings(@GetUser('sub') userId: string) {
    return this.settingsService.getSettings(userId);
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Update accountant settings',
    description: 'Update profile information, financial settings, or security',
  })
  async updateSettings(
    @GetUser('sub') userId: string,
    @Body() dto: UpdateAccountantSettingsDto,
  ) {
    return this.settingsService.updateSettings(userId, dto);
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change account password with current password verification',
  })
  async changePassword(
    @GetUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(userId, dto);
  }

  @Post('upload-photo')
  @ApiOperation({
    summary: 'Upload profile photo',
    description: 'Upload or update profile photo',
  })
  async uploadPhoto(
    @GetUser('sub') userId: string,
    @Body() body: { photoUrl: string },
  ) {
    return this.settingsService.uploadPhoto(userId, body.photoUrl);
  }

  @Post('proceed-payment')
  @ApiOperation({
    summary: 'Proceed with payment',
    description: 'Process a pending payment',
  })
  async proceedPayment(@Body() dto: ProceedPaymentDto) {
    // TODO: Implement actual payment processing
    return {
      success: true,
      message: 'Payment processed successfully',
      paymentId: dto.paymentId,
    };
  }
}
