import {
  successResponse,
  TResponse,
} from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { ProfitLossResponseDto } from '../dto/accounting-details.dto';
import {
  CreatePaymentRequestDto,
  PaymentRequestResponseDto,
  UpdatePaymentRequestDto,
} from '../dto/payment-request.dto';
import { AppError } from '@/core/error/handle-error.app';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProfitLossService {
  private readonly logger = new Logger(ProfitLossService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get profit & loss', 'ProfitLoss')
  async getProfitLoss(
    userId: string,
    year: number,
  ): Promise<TResponse<ProfitLossResponseDto>> {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const income = transactions.filter((t) => t.type === 'Income');
    const expenses = transactions.filter((t) => t.type === 'Expense');

    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = expenses.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const netProfitLoss = totalIncome - totalExpenses;

    // Generate monthly data for chart
    const monthlyData: Array<{ date: string; income: number; expenses: number }> =
      [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const monthKey = `${year}-${month.toString().padStart(2, '0')}-01`;

      const monthIncome = income
        .filter(
          (t) =>
            new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd,
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthExpenses = expenses
        .filter(
          (t) =>
            new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd,
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyData.push({
        date: monthKey,
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    const result: ProfitLossResponseDto = {
      year,
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netProfitLoss: netProfitLoss.toFixed(2),
      monthlyData,
      incomeTransactions: income.map((t) => ({
        source: t.source || 'Unknown',
        amount: Number(t.amount).toFixed(2),
        date: t.date.toISOString().split('T')[0],
      })),
      expenseTransactions: expenses.map((t) => ({
        source: t.source || 'Unknown',
        amount: Number(t.amount).toFixed(2),
        date: t.date.toISOString().split('T')[0],
      })),
    };

    return successResponse(result, 'Profit & loss data fetched successfully');
  }
}

@Injectable()
export class PaymentRequestService {
  private readonly logger = new Logger(PaymentRequestService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create payment request', 'PaymentRequest')
  async createPaymentRequest(
    userId: string,
    dto: CreatePaymentRequestDto,
  ): Promise<TResponse<PaymentRequestResponseDto>> {
    const paymentRequest = await this.prisma.paymentRequest.create({
      data: {
        userId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentDetails: dto.paymentDetails,
        notes: dto.notes,
        status: 'Pending',
      },
    });

    this.logger.log(
      `Payment request created: ${paymentRequest.paymentRequestId} for $${dto.amount}`,
    );

    return successResponse(
      paymentRequest as any,
      'Payment request created successfully',
    );
  }

  @HandleError('Failed to get payment requests', 'PaymentRequest')
  async getPaymentRequests(
    userId: string,
  ): Promise<TResponse<PaymentRequestResponseDto[]>> {
    const paymentRequests = await this.prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    });

    return successResponse(
      paymentRequests as any,
      'Payment requests fetched successfully',
    );
  }

  @HandleError('Failed to update payment request', 'PaymentRequest')
  async updatePaymentRequest(
    userId: string,
    paymentRequestId: string,
    dto: UpdatePaymentRequestDto,
  ): Promise<TResponse<PaymentRequestResponseDto>> {
    const existing = await this.prisma.paymentRequest.findUnique({
      where: { paymentRequestId, userId },
    });

    if (!existing) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Payment request not found');
    }

    const paymentRequest = await this.prisma.paymentRequest.update({
      where: { paymentRequestId, userId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.transactionRef && { transactionRef: dto.transactionRef }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status === 'Submitted' && { processedAt: new Date() }),
        ...(dto.status === 'Paid' && { paidAt: new Date() }),
      },
    });

    this.logger.log(
      `Payment request updated: ${paymentRequestId} to ${dto.status}`,
    );

    return successResponse(
      paymentRequest as any,
      'Payment request updated successfully',
    );
  }
}
