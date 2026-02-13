import {
    successPaginatedResponse,
    successResponse,
    TPaginatedResponse,
    TResponse,
} from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get dashboard', 'Distribution')
  async getDashboard(distributorId: string): Promise<TResponse<any>> {
    // Get stats using existing models
    const [submissionsToReview, releasesToDistribute, newClients, liveReleases] =
      await Promise.all([
        // Releases pending review (not yet approved)
        this.prisma.release.count({
          where: {
            OR: [{ status: null }, { status: 'Draft' }, { status: 'Pending' }],
          },
        }),
        // Approved releases (ready to distribute)
        this.prisma.release.count({
          where: { status: 'Approved' },
        }),
        // Total clients (users with role CLIENT)
        this.prisma.user.count({
          where: { role: 'CLIENT', status: 'ACTIVE' },
        }),
        // Already distributed releases
        this.prisma.release.count({
          where: { status: 'Distributed' },
        }),
      ]);

    const dashboard = {
      submissionsToReview,
      releasesToDistribute,
      newClients,
      liveReleases,
      recentActivity: [],
      distributionStatus: { completed: 0, inProgress: 0, failed: 0 },
      platformPerformance: [],
    };

    return successResponse(dashboard, 'Dashboard fetched successfully');
  }

  @HandleError('Failed to create distribution', 'Distribution')
  async createDistribution(
    distributorId: string,
    dto: any,
  ): Promise<TResponse<any>> {
    const distribution = await this.prisma.distribution.create({
      data: { ...dto, distributorId },
    });

    return successResponse(distribution, 'Distribution created successfully');
  }

  @HandleError('Failed to get distributions', 'Distribution')
  async getDistributions(
    distributorId: string,
    status: any,
    pg: any,
  ): Promise<TPaginatedResponse<any>> {
    const page = pg?.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg?.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = { distributorId };
    if (status) where.status = status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.distribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.distribution.count({ where }),
    ]);

    return successPaginatedResponse(
      items,
      { page, limit, total },
      'Distributions fetched successfully',
    );
  }

  @HandleError('Failed to get distribution', 'Distribution')
  async getDistributionById(
    distributorId: string,
    distributionId: string,
  ): Promise<TResponse<any>> {
    const distribution = await this.prisma.distribution.findFirst({
      where: { distributionId, distributorId },
    });

    return successResponse(distribution, 'Distribution fetched successfully');
  }

  @HandleError('Failed to update distribution', 'Distribution')
  async updateDistribution(
    distributorId: string,
    distributionId: string,
    dto: any,
  ): Promise<TResponse<any>> {
    const distribution = await this.prisma.distribution.update({
      where: { distributionId },
      data: dto,
    });

    return successResponse(distribution, 'Distribution updated successfully');
  }

  @HandleError('Failed to delete distribution', 'Distribution')
  async deleteDistribution(
    distributorId: string,
    distributionId: string,
  ): Promise<TResponse<any>> {
    await this.prisma.distribution.delete({ where: { distributionId } });

    return successResponse(null, 'Distribution deleted successfully');
  }

  @HandleError('Failed to add note', 'Distribution')
  async addNote(
    userId: string,
    distributionId: string,
    authorId: string,
    dto: any,
  ): Promise<TResponse<any>> {
    const note = await this.prisma.distributionNote.create({
      data: {
        distributionId,
        userId: authorId,
        content: dto.content,
        isInternal: dto.isInternal ?? false,
      },
    });

    return successResponse(note, 'Note added successfully');
  }
}