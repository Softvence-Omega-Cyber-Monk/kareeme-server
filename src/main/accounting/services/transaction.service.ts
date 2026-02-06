import {
  successResponse,
  TResponse,
} from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreateTransactionDto,
  TransactionResponseDto,
  UpdateTransactionDto,
} from '../dto/transaction.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create transaction', 'Transaction')
  async createTransaction(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TResponse<TransactionResponseDto>> {
    // Verify statement belongs to user
    const statement = await this.prisma.statement.findUnique({
      where: { statementId: dto.statementId, userId },
    });

    if (!statement) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        statementId: dto.statementId,
        type: dto.type,
        source: dto.source,
        description: dto.description,
        amount: dto.amount,
        date: new Date(dto.date),
        releaseId: dto.releaseId,
        trackId: dto.trackId,
        metadata: dto.metadata,
      },
    });

    // Update statement totals
    await this.updateStatementTotals(dto.statementId);

    this.logger.log(
      `Transaction created: ${transaction.transactionId} for statement ${dto.statementId}`,
    );

    return successResponse(
      transaction as any,
      'Transaction created successfully',
    );
  }

  @HandleError('Failed to get transactions', 'Transaction')
  async getTransactionsByStatement(
    userId: string,
    statementId: string,
  ): Promise<TResponse<TransactionResponseDto[]>> {
    // Verify statement belongs to user
    const statement = await this.prisma.statement.findUnique({
      where: { statementId, userId },
    });

    if (!statement) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { statementId },
      orderBy: { date: 'desc' },
    });

    return successResponse(
      transactions as any,
      'Transactions fetched successfully',
    );
  }

  @HandleError('Failed to get transaction', 'Transaction')
  async getTransactionById(
    userId: string,
    transactionId: string,
  ): Promise<TResponse<TransactionResponseDto>> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionId, userId },
    });

    if (!transaction) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Transaction not found');
    }

    return successResponse(
      transaction as any,
      'Transaction fetched successfully',
    );
  }

  @HandleError('Failed to update transaction', 'Transaction')
  async updateTransaction(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ): Promise<TResponse<TransactionResponseDto>> {
    const existing = await this.prisma.transaction.findUnique({
      where: { transactionId, userId },
    });

    if (!existing) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Transaction not found');
    }

    const transaction = await this.prisma.transaction.update({
      where: { transactionId, userId },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.source !== undefined && { source: dto.source }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.date && { date: new Date(dto.date) }),
      },
    });

    // Update statement totals
    await this.updateStatementTotals(existing.statementId);

    this.logger.log(`Transaction updated: ${transactionId} by user ${userId}`);

    return successResponse(
      transaction as any,
      'Transaction updated successfully',
    );
  }

  @HandleError('Failed to delete transaction', 'Transaction')
  async deleteTransaction(
    userId: string,
    transactionId: string,
  ): Promise<TResponse<any>> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionId, userId },
    });

    if (!transaction) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { transactionId, userId },
    });

    // Update statement totals
    await this.updateStatementTotals(transaction.statementId);

    this.logger.log(`Transaction deleted: ${transactionId} by user ${userId}`);

    return successResponse(
      { transactionId },
      'Transaction deleted successfully',
    );
  }

  private async updateStatementTotals(statementId: string): Promise<void> {
    const transactions = await this.prisma.transaction.findMany({
      where: { statementId },
    });

    const totalEarnings = transactions
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const payment = totalEarnings - totalExpenses;

    await this.prisma.statement.update({
      where: { statementId },
      data: {
        totalEarnings,
        totalExpenses,
        payment,
        closingBalance: payment,
      },
    });
  }
}
