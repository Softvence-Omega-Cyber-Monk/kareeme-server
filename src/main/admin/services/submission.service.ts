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
import type { Prisma } from '@prisma';
import { SubmissionCardDto, SubmissionDetailsDto } from '../dto/submission.dto';

@Injectable()
export class AdminSubmissionService {
  private readonly logger = new Logger(AdminSubmissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get submissions', 'AdminSubmission')
  async getSubmissions(
    status: string | null,
    releaseType: string | null,
    search: string | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<SubmissionCardDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    let where: Prisma.ReleaseWhereInput = {};

    // Filter by status (approval status)
    if (status === 'In Review' || status === 'PendingReview') {
      where.distributions = { none: {} };
    } else if (status === 'Approved') {
      where.distributions = {
        some: {
          status: { in: ['Distributed', 'InProgress', 'Pending'] },
        },
      };
    } else if (status === 'Declined') {
      where.distributions = { some: { status: 'Declined' } };
    }

    // Filter by release type (using status field since releaseType doesn't exist)
    if (releaseType) {
      where.status = releaseType;
    }

    // Search by releaseTitle or albumLevelArtistName
    if (search) {
      where.OR = [
        { releaseTitle: { contains: search, mode: 'insensitive' } },
        { albumLevelArtistName: { contains: search, mode: 'insensitive' } },
      ];
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
          distributions: true,
        },
      }),
      this.prisma.release.count({ where }),
    ]);

    const submissions = releases.map((release) => {
      let submissionStatus = 'In Review';
      const distribution = release.distributions[0];

      if (distribution) {
        if (distribution.status === 'Declined') {
          submissionStatus = 'Declined';
        } else {
          submissionStatus = 'Approved';
        }
      }

      return {
        releaseId: release.releaseId,
        title: release.releaseTitle || 'Untitled',
        artist: release.albumLevelArtistName || 'Unknown Artist',
        type: release.typeOfRelease || 'Single',
        tracks: release.tracks.length,
        releaseDate: release.releaseDate || new Date(),
        submitDate: release.createdAt,
        status: submissionStatus,
        artworkUrl: release.musicFileLink || '',
      };
    });

    return successPaginatedResponse(
      submissions,
      { page, limit, total },
      'Submissions fetched successfully',
    );
  }

  @HandleError('Failed to get submission details', 'AdminSubmission')
  async getSubmissionDetails(
    releaseId: string,
  ): Promise<TResponse<SubmissionDetailsDto>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
      include: {
        tracks: true,
        splitSheetAgreements: {
          include: { contributors: true },
        },
        distributions: true,
        user: true,
      },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    let status = 'In Review';
    const distribution = release.distributions[0];
    if (distribution) {
      status = distribution.status === 'Declined' ? 'Declined' : 'Approved';
    }

    // Map tracks using actual Track model fields
    const tracks = release.tracks.map((track) => ({
      isrc: track.trackIsrc || 'N/A',
      displayArtist: release.albumLevelArtistName || 'Unknown',
      mixVersion: track.trackMix || 'Original Mix',
      copyrightHolder: release.copyrightHolder || 'OneIsOneEnt',
      publisher: release.user?.name || 'OneIsOne Publishing',
      genre: track.trackGenre || release.genre || 'Pop/ R&B',
      language: release.language || 'English',
      explicit: track.explicitContent ? 'Yes' : 'No',
      originalReleaseDate: release.releaseDate || new Date(),
      tikTokStartTime: '0:15',
      territory: 'Worldwide',
      audioFile: track.audioFileId || 'Audio File 1',
    }));

    // Map artists from split sheet using actual Contributor model fields
    const artists =
      release.splitSheetAgreements[0]?.contributors.map((contrib) => ({
        artistName: contrib.fullName || 'Unknown',
        clientName: contrib.fullName || 'Unknown',
        realName: contrib.fullName || 'Unknown',
        artistType: contrib.contribution || 'Primary Artist',
        songwriterRole: 'Composer, Lyricist',
        masterSplit: Number(contrib.percentageSplit || 0),
        contractName: `${contrib.fullName} Contract`,
        spotifyId: '1232343434349',
        appleId: 'apple:artist:someid',
      })) || [];

    const details: SubmissionDetailsDto = {
      releaseId: release.releaseId,
      status,
      labelName: release.labelName || 'OneIsOneEnt',
      catalogueNumber: 'ONELS-001',
      releaseType: release.typeOfRelease || 'Single',
      releaseDate: release.releaseDate || new Date(),
      distributor: 'Distrokid',
      releaseArtist: release.albumLevelArtistName || 'Unknown Artist',
      releaseTitle: release.releaseTitle || 'Untitled',
      releaseCLink: `(c) 2024 ${release.labelName || 'OneIsOneEnt'}`,
      releasePLink: `(P) 2024 ${release.labelName || 'OneIsOneEnt'}`,
      artworkLink: release.musicFileLink || 'View Artwork',
      upc: 'N/A',
      tracks,
      artists,
    };

    return successResponse(details, 'Submission details fetched successfully');
  }

  @HandleError('Failed to approve submission', 'AdminSubmission')
  async approveSubmission(releaseId: string): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Check if already approved
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: { releaseId },
    });

    if (existingDistribution && existingDistribution.status !== 'Declined') {
      throw new AppError(
        HttpStatus.CONFLICT,
        'Release already approved/distributed',
      );
    }

    // Create or update distribution record
    let distribution;
    if (existingDistribution) {
      distribution = await this.prisma.distribution.update({
        where: { distributionId: existingDistribution.distributionId },
        data: {
          status: 'Pending',
          approvedAt: new Date(),
          declinedAt: null,
        },
      });
    } else {
      distribution = await this.prisma.distribution.create({
        data: {
          distributorId: release.userId,
          userId: release.userId,
          releaseId: release.releaseId,
          status: 'Pending',
          approvedAt: new Date(),
        },
      });
    }

    // Create activity
    await this.prisma.recentActivity.create({
      data: {
        type: 'approval',
        title: `Release approved for ${release.albumLevelArtistName || 'artist'}`,
        description: `"${release.releaseTitle || 'Release'}" scheduled for distribution`,
        userId: release.userId,
        releaseId: release.releaseId,
      },
    });

    this.logger.log(`Release approved: ${releaseId}`);

    return successResponse(distribution, 'Release approved successfully');
  }

  @HandleError('Failed to decline submission', 'AdminSubmission')
  async declineSubmission(
    releaseId: string,
    reason: string,
  ): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Check if already has a distribution
    const existingDistribution = await this.prisma.distribution.findFirst({
      where: { releaseId },
    });

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
          distributorId: release.userId,
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
        userId: release.userId,
        content: `Declined: ${reason}`,
        isInternal: false,
      },
    });

    this.logger.log(`Release declined: ${releaseId}`);

    return successResponse(distribution, 'Release declined successfully');
  }

  @HandleError('Failed to export submission data', 'AdminSubmission')
  async exportSubmissionData(releaseId: string): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
      include: {
        tracks: true,
        splitSheetAgreements: {
          include: { contributors: true },
        },
      },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Return complete data for export using actual schema
    const exportData = {
      release: {
        title: release.releaseTitle,
        artist: release.albumLevelArtistName,
        releaseType: release.typeOfRelease,
        releaseDate: release.releaseDate,
        label: release.labelName,
        upc: 'N/A',
        genre: release.genre,
      },
      tracks: release.tracks.map((track) => ({
        title: track.trackTitle,
        isrc: track.trackIsrc,
        duration: track.audioFileUrl,
        genre: track.trackGenre,
      })),
      contributors: release.splitSheetAgreements[0]?.contributors || [],
    };

    return successResponse(exportData, 'Submission data exported successfully');
  }
}
