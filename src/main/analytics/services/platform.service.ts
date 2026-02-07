import {
  successResponse,
  TResponse,
} from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreatePlatformAnalyticsDto,
  Platform,
  PlatformAnalyticsResponseDto,
  PlatformOverviewDto,
} from '../dto/platform.dto';

@Injectable()
export class PlatformAnalyticsService {
  private readonly logger = new Logger(PlatformAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create platform analytics', 'PlatformAnalytics')
  async createPlatformAnalytics(
    userId: string,
    dto: CreatePlatformAnalyticsDto,
  ): Promise<TResponse<PlatformAnalyticsResponseDto>> {
    const date = new Date(dto.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Check if already exists
    const existing = await this.prisma.platformAnalytics.findUnique({
      where: {
        userId_platform_date: {
          userId,
          platform: dto.platform,
          date,
        },
      },
    });

    if (existing) {
      // Update existing
      const updated = await this.prisma.platformAnalytics.update({
        where: { analyticsId: existing.analyticsId },
        data: {
          totalViews: dto.totalViews ?? existing.totalViews,
          totalEarnings: dto.totalEarnings ?? existing.totalEarnings,
          freeEarnings: dto.freeEarnings ?? existing.freeEarnings,
          freeViews: dto.freeViews ?? existing.freeViews,
          premiumEarnings: dto.premiumEarnings ?? existing.premiumEarnings,
          premiumViews: dto.premiumViews ?? existing.premiumViews,
        },
      });

      return successResponse(
        updated as any,
        'Platform analytics updated successfully',
      );
    }

    const analytics = await this.prisma.platformAnalytics.create({
      data: {
        userId,
        platform: dto.platform,
        date,
        month,
        year,
        totalViews: dto.totalViews || 0,
        totalEarnings: dto.totalEarnings || 0,
        freeEarnings: dto.freeEarnings || 0,
        freeViews: dto.freeViews || 0,
        premiumEarnings: dto.premiumEarnings || 0,
        premiumViews: dto.premiumViews || 0,
      },
    });

    this.logger.log(
      `Platform analytics created: ${analytics.analyticsId} for ${dto.platform}`,
    );

    return successResponse(
      analytics as any,
      'Platform analytics created successfully',
    );
  }

  @HandleError('Failed to get dashboard', 'PlatformAnalytics')
  async getDashboard(
    userId: string,
  ): Promise<TResponse<PlatformOverviewDto[]>> {
    const platforms = Object.values(Platform);
    const overviews: PlatformOverviewDto[] = [];

    for (const platform of platforms) {
      try {
        const overview = await this.getPlatformOverview(userId, platform);
        overviews.push(overview.data);
      } catch (error) {
        // Skip platforms with no data
        continue;
      }
    }

    return successResponse(overviews, 'Dashboard data fetched successfully');
  }

  @HandleError('Failed to get platform overview', 'PlatformAnalytics')
  async getPlatformOverview(
    userId: string,
    platform: Platform,
  ): Promise<TResponse<PlatformOverviewDto>> {
    // Get latest analytics
    const latest = await this.prisma.platformAnalytics.findFirst({
      where: { userId, platform },
      orderBy: { date: 'desc' },
    });

    if (!latest) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        `No analytics found for ${platform}`,
      );
    }

    // Get last 12 months data
    const endDate = latest.date;
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 11);

    const monthlyData = await this.prisma.platformAnalytics.findMany({
      where: {
        userId,
        platform,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const estimatedEarnings = monthlyData.map((m) => ({
      month: this.getMonthName(m.month).substring(0, 3),
      views: m.totalViews,
      earnings: Number(m.totalEarnings),
    }));

    // Get top countries
    const topCountries = await this.prisma.geoTrend.findMany({
      where: {
        userId,
        platform,
        region: null, // Only countries, not regions
      },
      take: 5,
      orderBy: { earnings: 'desc' },
    });

    // Get top US regions
    const topUSRegions = await this.prisma.geoTrend.findMany({
      where: {
        userId,
        platform,
        country: 'United States',
        region: { not: null },
      },
      take: 5,
      orderBy: { views: 'desc' },
    });

    // Get top assets
    const topAssets = await this.prisma.asset.findMany({
      where: { userId, platform },
      take: 5,
      orderBy: { totalEarnings: 'desc' },
    });

    // Get top claims
    const topClaims = await this.prisma.claim.findMany({
      where: { userId, platform },
      take: 5,
      orderBy: { totalEarnings: 'desc' },
    });

    // Calculate percentages
    const totalEarnings = Number(latest.totalEarnings);
    const freePercentage =
      totalEarnings > 0
        ? Math.round((Number(latest.freeEarnings) / totalEarnings) * 100)
        : 0;

    const overview: PlatformOverviewDto = {
      platform,
      totalViews: this.formatNumber(latest.totalViews),
      totalEarnings: `$${totalEarnings.toFixed(2)} USD`,
      earningsByType: {
        free: {
          earnings: `$${Number(latest.freeEarnings).toFixed(2)}`,
          views: this.formatNumber(latest.freeViews),
          percentage: freePercentage,
        },
        premium: {
          earnings: `$${Number(latest.premiumEarnings).toFixed(2)}`,
          views: this.formatNumber(latest.premiumViews),
          percentage: 100 - freePercentage,
        },
      },
      estimatedEarnings,
      topCountries: topCountries.map((c) => ({
        country: c.country,
        earnings: `$${Number(c.earnings).toFixed(2)} USD`,
      })),
      topUSRegions: topUSRegions.map((r) => ({
        region: r.region!,
        views: r.views,
      })),
      topAssets: topAssets.map((a) => ({
        title: a.title,
        earnings: `$${Number(a.totalEarnings).toFixed(2)} USD`,
      })),
      topClaims: topClaims.map((c) => ({
        title: c.title,
        earnings: `$${Number(c.totalEarnings).toFixed(2)} USD`,
      })),
    };

    return successResponse(overview, 'Platform overview fetched successfully');
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  }
}
