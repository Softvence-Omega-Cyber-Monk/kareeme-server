import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTransactionDto,
  TransactionResponseDto,
  UpdateTransactionDto,
} from '../dto/transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { ProfitLossResponseDto } from '../dto/accounting-details.dto';
import { ProfitLossService, PaymentRequestService } from '../services/profit-loss.service';
import {
  CreatePaymentRequestDto,
  PaymentRequestResponseDto,
  UpdatePaymentRequestDto,
} from '../dto/payment-request.dto';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Accounting - Transactions')
@Controller('accounting/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description: 'Add an income or expense transaction to a statement',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  async createTransaction(
    @GetUser('sub') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(userId, dto);
  }

  @Get('statement/:statementId')
  @ApiOperation({
    summary: 'Get transactions for a statement',
    description: 'Retrieve all transactions associated with a specific statement',
  })
  @ApiParam({
    name: 'statementId',
    description: 'Statement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions fetched successfully',
    type: [TransactionResponseDto],
  })
  async getTransactionsByStatement(
    @GetUser('sub') userId: string,
    @Param('statementId') statementId: string,
  ) {
    return this.transactionService.getTransactionsByStatement(
      userId,
      statementId,
    );
  }

  @Get(':transactionId')
  @ApiOperation({
    summary: 'Get a single transaction',
    description: 'Retrieve detailed information about a specific transaction',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction fetched successfully',
    type: TransactionResponseDto,
  })
  async getTransactionById(
    @GetUser('sub') userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionService.getTransactionById(userId, transactionId);
  }

  @Patch(':transactionId')
  @ApiOperation({
    summary: 'Update a transaction',
    description: 'Update transaction details',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: TransactionResponseDto,
  })
  async updateTransaction(
    @GetUser('sub') userId: string,
    @Param('transactionId') transactionId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.updateTransaction(
      userId,
      transactionId,
      dto,
    );
  }

  @Delete(':transactionId')
  @ApiOperation({
    summary: 'Delete a transaction',
    description: 'Delete a transaction from a statement',
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  async deleteTransaction(
    @GetUser('sub') userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionService.deleteTransaction(userId, transactionId);
  }
}

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Accounting - Profit & Loss')
@Controller('accounting/profit-loss')
export class ProfitLossController {
  constructor(private readonly profitLossService: ProfitLossService) {}

  @Get()
  @ApiOperation({
    summary: 'Get profit & loss report',
    description:
      'Retrieve income vs expenses with monthly breakdown and transaction details',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    example: 2024,
    description: 'Year for the report',
  })
  @ApiResponse({
    status: 200,
    description: 'Profit & loss data fetched successfully',
    type: ProfitLossResponseDto,
  })
  async getProfitLoss(
    @GetUser('sub') userId: string,
    @Query('year') year: number,
  ) {
    return this.profitLossService.getProfitLoss(userId, +year);
  }
}

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Accounting - Payment Requests')
@Controller('accounting/payment-requests')
export class PaymentRequestController {
  constructor(
    private readonly paymentRequestService: PaymentRequestService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a payment request',
    description: 'Request a payout for earned royalties',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment request created successfully',
    type: PaymentRequestResponseDto,
  })
  async createPaymentRequest(
    @GetUser('sub') userId: string,
    @Body() dto: CreatePaymentRequestDto,
  ) {
    return this.paymentRequestService.createPaymentRequest(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payment requests',
    description: 'Retrieve all payment requests for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment requests fetched successfully',
    type: [PaymentRequestResponseDto],
  })
  async getPaymentRequests(@GetUser('sub') userId: string) {
    return this.paymentRequestService.getPaymentRequests(userId);
  }

  @Patch(':paymentRequestId')
  @ApiOperation({
    summary: 'Update a payment request',
    description: 'Update payment request status or details',
  })
  @ApiParam({
    name: 'paymentRequestId',
    description: 'Payment Request ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment request updated successfully',
    type: PaymentRequestResponseDto,
  })
  async updatePaymentRequest(
    @GetUser('sub') userId: string,
    @Param('paymentRequestId') paymentRequestId: string,
    @Body() dto: UpdatePaymentRequestDto,
  ) {
    return this.paymentRequestService.updatePaymentRequest(
      userId,
      paymentRequestId,
      dto,
    );
  }
}
