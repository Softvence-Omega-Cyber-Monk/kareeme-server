import { successResponse, TResponse } from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { TransactionType } from '@prisma';
import {
  AccountingDashboardDto,
  PaymentsEarningsDto,
  ProfitLossDto,
} from '../dto/accountant.dto';

@Injectable()
export class AccountantDashboardService {
  private readonly logger = new Logger(AccountantDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get accounting dashboard', 'AccountantDashboard')
  async getAccountingDashboard(
    userId: string,
  ): Promise<TResponse<AccountingDashboardDto>> {
    // Get total earnings from transactions
    const totalEarningsResult = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: TransactionType.Income },
    });
    const totalEarnings = Number(totalEarningsResult._sum.amount || 0);

    // Calculate platform commission (20%)
    const platformCommission = totalEarnings * 0.2;
    const netEarnings = totalEarnings - platformCommission;

    // Get earnings breakdown by platform
    // use PlatformAnalytics for platform earnings (existing model)
    const platformEarnings = await this.prisma.platformAnalytics.findMany({
      where: { userId },
      orderBy: { platform: 'asc' },
    });

    const earningsBreakdown = platformEarnings.map((pe: any) => ({
      platform: pe.platform,
      grossEarnings: `$${Number(pe.totalEarnings || 0)}`,
      commission: `$${Number(pe.freeEarnings || 0)}`,
      netEarnings: `$${Number(pe.total_earnings || pe.totalEarnings || 0)}`,
    }));

    // Get pending payment amount
    // sum pending payment requests (use PaymentRequest model)
    const pendingPayments = await this.prisma.paymentRequest.aggregate({
      _sum: { amount: true },
      where: { userId, status: 'Pending' },
    });
    const pendingPaymentAmount = Number(pendingPayments._sum.amount || 0);

    const dashboard: AccountingDashboardDto = {
      totalEarnings: `$${totalEarnings.toLocaleString()}`,
      platformCommission: `$${platformCommission.toLocaleString()}`,
      netEarnings: `$${netEarnings.toLocaleString()}`,
      earningsBreakdown,
      pendingPaymentAmount: `$${pendingPaymentAmount.toFixed(2)}`,
    };

    return successResponse(dashboard, 'Dashboard fetched successfully');
  }

  @HandleError('Failed to get payments and earnings', 'AccountantDashboard')
  async getPaymentsEarnings(
    userId: string,
  ): Promise<TResponse<PaymentsEarningsDto>> {
    // Total platform earnings
    const totalResult = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: TransactionType.Income },
    });
    const totalPlatformEarnings = Number(totalResult._sum.amount || 0);

    // Earnings by platform
    const platforms = [
      'YouTube',
      'Spotify',
      'Apple Music',
      'SoundCloud',
      'Deezer',
      'Audiomack',
      'TIDAL',
      'iHeartRadio',
    ];
    const earningsOverview = platforms.map((platform) => ({
      platform,
      amount: '$2,000',
    }));

    // Pending payments
    const pending = await this.prisma.paymentRequest.findMany({
      where: { userId, status: 'Pending' },
      orderBy: { requestedAt: 'desc' },
      take: 10,
    });

    const pendingPayments = pending.map((p: any) => ({
      paymentId: p.paymentRequestId,
      clientName: p.user?.name || '',
      amount: `$${Number(p.amount).toFixed(2)}`,
      status: p.status,
    }));

    // Payment history
    const history = await this.prisma.paymentRequest.findMany({
      where: { userId, status: 'Paid' },
      orderBy: { paidAt: 'desc' },
      take: 10,
    });

    const paymentHistory = history.map((h: any) => ({
      historyId: h.paymentRequestId,
      date: h.paidAt || h.processedAt,
      clientName: h.user?.name || '',
      amount: `$${Number(h.amount).toFixed(2)}`,
      method: h.paymentMethod || 'N/A',
    }));

    const data: PaymentsEarningsDto = {
      totalPlatformEarnings: `$${totalPlatformEarnings.toLocaleString()}`,
      earningsOverview,
      pendingPayments,
      paymentHistory,
    };

    return successResponse(data, 'Payments and earnings fetched successfully');
  }

  @HandleError('Failed to get profit and loss', 'AccountantDashboard')
  async getProfitLoss(userId: string): Promise<TResponse<ProfitLossDto>> {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'June',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const now = new Date();
    const monthlyData = [];

    // Get monthly income/expense for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            type: TransactionType.Income,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId,
            type: TransactionType.Expense,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      monthlyData.push({
        month: months[date.getMonth()],
        income: Number(income._sum.amount || 0),
        expense: Number(expense._sum.amount || 0),
      });
    }

    // Get client-wise profit/loss
    // Use Statement model as source of client financial summaries
    const clients = await this.prisma.statement.findMany({
      take: 15,
      orderBy: { totalEarnings: 'desc' },
      include: { user: true },
    });

    const clientData = clients.map((client: any) => ({
      clientName: client.user?.name || 'Unknown',
      income: `$${Number(client.totalEarnings || 0).toFixed(2)}`,
      expenses: `$${Number(client.totalExpenses || 0).toFixed(2)}`,
    }));

    const data: ProfitLossDto = {
      monthlyData,
      clientData,
    };

    return successResponse(data, 'Profit & Loss fetched successfully');
  }
}
