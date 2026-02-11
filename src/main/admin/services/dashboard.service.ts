import { successResponse, TResponse } from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { TransactionType } from '@prisma';
import { DashboardResponseDto } from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get dashboard', 'Dashboard')
  async getDashboard(): Promise<TResponse<DashboardResponseDto>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = await this.prisma.dashboardStats.findUnique({
      where: { date: today },
    });

    if (!stats) {
      stats = await this.updateStats();
    }

    const revenueData = await this.getRevenueData();
    const profitLossData = await this.getProfitLossData();

    const activities = await this.prisma.recentActivity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const recentActivity = activities.map((activity) => ({
      activityId: activity.activityId,
      type: activity.type,
      title: activity.title,
      description: activity.description || '',
      timestamp: this.formatTimestamp(activity.createdAt),
      metadata: activity.metadata,
    }));

    const dashboard: DashboardResponseDto = {
      stats: {
        totalClients: stats.totalClients,
        totalReleases: stats.totalReleases,
        activeSubmissions: stats.activeSubmissions,
        totalRevenue: stats.totalRevenue.toString(),
        clientsGrowth: Number(stats.clientsGrowth),
        releasesGrowth: Number(stats.releasesGrowth),
        submissionsGrowth: Number(stats.submissionsGrowth),
        revenueGrowth: Number(stats.revenueGrowth),
      },
      revenueData,
      profitLossData,
      recentActivity,
    };

    return successResponse(dashboard, 'Dashboard data fetched successfully');
  }

  @HandleError('Failed to update stats', 'Dashboard')
  async updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [totalClients, totalReleases, activeSubmissions, transactions] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'CLIENT' } }),
        this.prisma.release.count(),
        this.prisma.release.count({ where: { distributions: { none: {} } } }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: TransactionType.Income },
        }),
      ]);

    const totalRevenue = transactions._sum.amount || 0;

    const lastMonthStats = await this.prisma.dashboardStats.findUnique({
      where: { date: lastMonth },
    });

    const clientsGrowth = lastMonthStats
      ? ((totalClients - lastMonthStats.totalClients) /
          lastMonthStats.totalClients) *
        100
      : 0;
    const releasesGrowth = lastMonthStats
      ? ((totalReleases - lastMonthStats.totalReleases) /
          lastMonthStats.totalReleases) *
        100
      : 0;
    const submissionsGrowth = lastMonthStats
      ? ((activeSubmissions - lastMonthStats.activeSubmissions) /
          (lastMonthStats.activeSubmissions || 1)) *
        100
      : 0;
    const revenueGrowth = lastMonthStats
      ? ((Number(totalRevenue) - Number(lastMonthStats.totalRevenue)) /
          Number(lastMonthStats.totalRevenue || 1)) *
        100
      : 0;

    return await this.prisma.dashboardStats.upsert({
      where: { date: today },
      create: {
        date: today,
        totalClients,
        totalReleases,
        activeSubmissions,
        totalRevenue,
        clientsGrowth,
        releasesGrowth,
        submissionsGrowth,
        revenueGrowth,
      },
      update: {
        totalClients,
        totalReleases,
        activeSubmissions,
        totalRevenue,
        clientsGrowth,
        releasesGrowth,
        submissionsGrowth,
        revenueGrowth,
      },
    });
  }

  private async getRevenueData() {
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
    const revenueData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: TransactionType.Income,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      revenueData.push({
        month: months[date.getMonth()],
        value: Number(result._sum.amount || 0),
      });
    }

    return revenueData;
  }

  private async getProfitLossData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'];
    const now = new Date();
    const profitLossData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            type: TransactionType.Income,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            type: TransactionType.Expense,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      profitLossData.push({
        month: months[i],
        profit: Number(income._sum.amount || 0),
        loss: Number(expense._sum.amount || 0),
      });
    }

    return profitLossData;
  }

  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (hours < 48) return 'Yesterday at ' + date.toLocaleTimeString();
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  }
}
