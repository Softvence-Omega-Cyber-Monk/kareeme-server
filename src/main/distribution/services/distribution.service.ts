import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma';
import {
  AddDistributionNoteDto,
  CreateDistributionDto,
  DashboardStatsDto,
  DistributionResponseDto,
  DistributionStatus,
  UpdateDistributionDto,
} from '../dto/distribution.dto';

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get dashboard', 'Distribution')
  async getDashboard(
    distributorId: string,
  ): Promise<TResponse<DashboardStatsDto>> {
    const [
      submissionsToReview,
      releasesToDistribute,
      newClients,
      liveReleases,
    ] = await Promise.all([
      this.prisma.submission.count({
        where: { distributorId, status: 'PendingReview' },
      }),
      this.prisma.distribution.count({
        where: { distributorId, status: 'Pending' },
      }),
      this.prisma.distributorClient.count({
        where: {
          distributorId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.distribution.count({
        where: { distributorId, status: 'Distributed' },
      }),
    ]);

    // Get recent activity
    const recentSubmissions = await this.prisma.submission.findMany({
      where: { distributorId },
      take: 5,
      orderBy: { submissionDate: 'desc' },
      include: { user: true, release: true },
    });

    const recentActivity = recentSubmissions.map((sub:any) => ({
      title: `New ${sub.type} from ${sub.user.name || 'Unknown'}`,
      subtitle: `Submission: ${sub.status}`,
      timestamp: this.formatTimestamp(sub.submissionDate),
    }));

    // Distribution status breakdown
    const [completed, inProgress, failed] = await Promise.all([
      this.prisma.distribution.count({
        where: { distributorId, status: 'Distributed' },
      }),
      this.prisma.distribution.count({
        where: { distributorId, status: 'InProgress' },
      }),
      this.prisma.distribution.count({
        where: { distributorId, status: 'Failed' },
      }),
    ]);

    // Platform performance
    const platformStats = await this.prisma.platformDistribution.groupBy({
      by: ['platform'],
      _sum: { streams: true },
      where: {
        distribution: { distributorId },
      },
    });

    const platformPerformance = platformStats.map((p) => ({
      platform: p.platform,
      streams: this.formatNumber(p._sum.streams || 0),
    }));

    const dashboard: DashboardStatsDto = {
      submissionsToReview,
      releasesToDistribute,
      newClients,
      liveReleases,
      recentActivity,
      distributionStatus: { completed, inProgress, failed },
      platformPerformance,
    };

    return successResponse(dashboard, 'Dashboard data fetched successfully');
  }

  @HandleError('Failed to create distribution', 'Distribution')
  async createDistribution(
    distributorId: string,
    dto: CreateDistributionDto,
  ): Promise<TResponse<DistributionResponseDto>> {
    const distribution = await this.prisma.distribution.create({
      data: {
        distributorId,
        userId: dto.userId,
        releaseId: dto.releaseId,
        status: 'Pending',
        platformStatuses: {
          create: (dto.platforms || []).map((platform) => ({
            platform,
            status: 'Pending',
          })),
        },
      },
      include: {
        release: true,
        user: true,
        platformStatuses: true,
        notes: { include: { user: true } },
      },
    });

    this.logger.log(
      `Distribution created: ${distribution.distributionId} for release ${dto.releaseId}`,
    );

    return successResponse(
      distribution as any,
      'Distribution created successfully',
    );
  }

  @HandleError('Failed to get distributions', 'Distribution')
  async getDistributions(
    distributorId: string,
    status: DistributionStatus | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<DistributionResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DistributionWhereInput = {
      distributorId,
      ...(status && { status }),
    };

    const [distributions, total] = await this.prisma.$transaction([
      this.prisma.distribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          release: true,
          user: true,
          platformStatuses: true,
          notes: { include: { user: true } },
        },
      }),
      this.prisma.distribution.count({ where }),
    ]);

    return successPaginatedResponse(
      distributions as any,
      { page, limit, total },
      'Distributions fetched successfully',
    );
  }

  @HandleError('Failed to get distribution', 'Distribution')
  async getDistributionById(
    distributorId: string,
    distributionId: string,
  ): Promise<TResponse<DistributionResponseDto>> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { distributionId, distributorId },
      include: {
        release: {
          include: {
            tracks: true,
            releaseArtists: { include: { artist: true } },
          },
        },
        user: true,
        platformStatuses: true,
        notes: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!distribution) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Distribution not found');
    }

    return successResponse(
      distribution as any,
      'Distribution fetched successfully',
    );
  }

  @HandleError('Failed to update distribution', 'Distribution')
  async updateDistribution(
    distributorId: string,
    distributionId: string,
    dto: UpdateDistributionDto,
  ): Promise<TResponse<DistributionResponseDto>> {
    const existing = await this.prisma.distribution.findUnique({
      where: { distributionId, distributorId },
    });

    if (!existing) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Distribution not found');
    }

    const distribution = await this.prisma.distribution.update({
      where: { distributionId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.approvedAt && { approvedAt: new Date(dto.approvedAt) }),
        ...(dto.distributedAt && { distributedAt: new Date(dto.distributedAt) }),
        ...(dto.declinedAt && { declinedAt: new Date(dto.declinedAt) }),
      },
      include: {
        release: true,
        user: true,
        platformStatuses: true,
        notes: { include: { user: true } },
      },
    });

    this.logger.log(
      `Distribution updated: ${distributionId} to status ${dto.status}`,
    );

    return successResponse(
      distribution as any,
      'Distribution updated successfully',
    );
  }

  @HandleError('Failed to delete distribution', 'Distribution')
  async deleteDistribution(
    distributorId: string,
    distributionId: string,
  ): Promise<TResponse<any>> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { distributionId, distributorId },
    });

    if (!distribution) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Distribution not found');
    }

    await this.prisma.distribution.delete({
      where: { distributionId },
    });

    this.logger.log(
      `Distribution deleted: ${distributionId} by distributor ${distributorId}`,
    );

    return successResponse(
      { distributionId },
      'Distribution deleted successfully',
    );
  }

  @HandleError('Failed to add note', 'Distribution')
  async addNote(
    distributorId: string,
    distributionId: string,
    userId: string,
    dto: AddDistributionNoteDto,
  ): Promise<TResponse<any>> {
    const distribution = await this.prisma.distribution.findUnique({
      where: { distributionId, distributorId },
    });

    if (!distribution) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Distribution not found');
    }

    const note = await this.prisma.distributionNote.create({
      data: {
        distributionId,
        userId,
        content: dto.content,
        isInternal: dto.isInternal || false,
      },
      include: { user: true },
    });

    this.logger.log(`Note added to distribution: ${distributionId}`);

    return successResponse(note, 'Note added successfully');
  }

  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday at ' + date.toLocaleTimeString();
    return date.toLocaleDateString();
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  }
}
