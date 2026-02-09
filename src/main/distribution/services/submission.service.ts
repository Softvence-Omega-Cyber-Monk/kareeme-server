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
  ApproveSubmissionDto,
  DeclineSubmissionDto,
  SubmissionResponseDto,
  SubmissionStatus,
} from '../dto/submission.dto';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get submissions', 'Submission')
  async getSubmissions(
    distributorId: string,
    status: SubmissionStatus | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<SubmissionResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    // Build WHERE clause for releases
    let where: Prisma.ReleaseWhereInput = {};

    if (status === 'PendingReview') {
      // Show releases that don't have a distribution yet
      where = {
        distributions: {
          none: {
            distributorId,
          },
        },
      };
    } else if (status === 'Approved') {
      // Show releases with approved/distributed status
      where = {
        distributions: {
          some: {
            distributorId,
            status: { in: ['Distributed', 'InProgress', 'Pending'] },
          },
        },
      };
    } else if (status === 'Declined') {
      // Show releases that were declined
      where = {
        distributions: {
          some: {
            distributorId,
            status: 'Declined',
          },
        },
      };
    }

    const [releases, total] = await this.prisma.$transaction([
      this.prisma.release.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          tracks: true,
          distributions: {
            where: { distributorId },
          },
        },
      }),
      this.prisma.release.count({ where }),
    ]);

    // Map releases to submission response format
    const submissions = releases.map((release) => {
      const distribution = release.distributions[0];
      
      let submissionStatus: SubmissionStatus;
      if (!distribution) {
        submissionStatus = SubmissionStatus.PendingReview;
      } else if (distribution.status === 'Declined') {
        submissionStatus = SubmissionStatus.Declined;
      } else {
        submissionStatus = SubmissionStatus.Approved;
      }

      return {
        submissionId: release.releaseId, // Using releaseId as submissionId
        userId: release.userId,
        releaseId: release.releaseId,
        type: release.typeOfRelease,
        status: submissionStatus,
        submissionDate: release.createdAt,
        user: release.user,
        release: {
          ...release,
          distributions: undefined, // Remove to avoid circular reference
        },
        createdAt: release.createdAt,
      };
    });

    return successPaginatedResponse(
      submissions as any,
      { page, limit, total },
      'Submissions fetched successfully',
    );
  }

  @HandleError('Failed to get submission details', 'Submission')
  async getSubmissionById(
    distributorId: string,
    releaseId: string,
  ): Promise<TResponse<SubmissionResponseDto>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
      include: {
        user: true,
        tracks: true,
        splitSheetAgreements: {
          include: { contributors: true },
        },
        distributions: {
          where: { distributorId },
        },
      },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const distribution = release.distributions[0];
    let submissionStatus: SubmissionStatus;
    
    if (!distribution) {
      submissionStatus = SubmissionStatus.PendingReview;
    } else if (distribution.status === 'Declined') {
      submissionStatus = SubmissionStatus.Declined;
    } else {
      submissionStatus = SubmissionStatus.Approved;
    }

    const submission = {
      submissionId: release.releaseId,
      userId: release.userId,
      releaseId: release.releaseId,
      type: release.typeOfRelease,
      status: submissionStatus,
      submissionDate: release.createdAt,
      user: release.user,
      release: {
        ...release,
        distributions: undefined,
      },
      createdAt: release.createdAt,
    };

    return successResponse(
      submission as any,
      'Submission details fetched successfully',
    );
  }

  @HandleError('Failed to approve submission', 'Submission')
  async approveSubmission(
    distributorId: string,
    releaseId: string,
    dto: ApproveSubmissionDto,
  ): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Check if already approved/distributed
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: { releaseId, distributorId },
    });

    if (existingDistribution) {
      throw new AppError(
        HttpStatus.CONFLICT,
        'Release already approved/distributed',
      );
    }

    // Create distribution record
    const distribution = await this.prisma.distribution.create({
      data: {
        distributorId,
        userId: release.userId,
        releaseId: release.releaseId,
        status: 'Pending',
        approvedAt: new Date(),
      },
      include: {
        release: true,
      },
    });

    // Add note if provided
    if (dto.note) {
      await this.prisma.distributionNote.create({
        data: {
          distributionId: distribution.distributionId,
          userId: distributorId,
          content: dto.note,
          isInternal: false,
        },
      });
    }

    this.logger.log(
      `Release ${releaseId} approved by distributor ${distributorId}`,
    );

    return successResponse(distribution, 'Release approved successfully');
  }

  @HandleError('Failed to decline submission', 'Submission')
  async declineSubmission(
    distributorId: string,
    releaseId: string,
    dto: DeclineSubmissionDto,
  ): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Check if already has a distribution
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: { releaseId, distributorId },
    });

    if (existingDistribution && existingDistribution.status !== 'Pending') {
      throw new AppError(
        HttpStatus.CONFLICT,
        'Cannot decline already processed release',
      );
    }

    // Create or update distribution with declined status
    let distribution;
    if (existingDistribution) {
      distribution = await this.prisma.distribution.update({
        where: { distributionId: existingDistribution.distributionId },
        data: {
          status: 'Declined',
          declinedAt: new Date(),
        },
      });
    } else {
      distribution = await this.prisma.distribution.create({
        data: {
          distributorId,
          userId: release.userId,
          releaseId: release.releaseId,
          status: 'Declined',
          declinedAt: new Date(),
        },
      });
    }

    // Add decline reason as note
    await this.prisma.distributionNote.create({
      data: {
        distributionId: distribution.distributionId,
        userId: distributorId,
        content: `Declined: ${dto.reason}`,
        isInternal: false,
      },
    });

    this.logger.log(
      `Release ${releaseId} declined by distributor ${distributorId}`,
    );

    return successResponse(distribution, 'Release declined successfully');
  }
}
