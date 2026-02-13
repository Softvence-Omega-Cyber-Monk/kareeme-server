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

@Injectable()
export class DistributionSubmissionService {
  private readonly logger = new Logger(DistributionSubmissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all releases as submissions
   * Submissions ARE releases - filtered by status
   */
  @HandleError('Failed to get submissions', 'DistributionSubmission')
  async getSubmissions(
    status: string | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<any>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    let where: Prisma.ReleaseWhereInput = {};

    // Filter by submission/approval status
    if (status === 'PendingReview' || status === 'Pending') {
      // Releases not yet reviewed: status is null OR Draft OR Pending
      where.OR = [{ status: null }, { status: 'Draft' }, { status: 'Pending' }];
    } else if (status === 'Approved') {
      where.status = 'Approved';
    } else if (status === 'Declined') {
      where.status = 'Declined';
    }

    const [releases, total] = await this.prisma.$transaction([
      this.prisma.release.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          tracks: true,
          releaseArtists: {
            include: { artist: { select: { name: true } } },
          },
          backCatalogue: {
            select: {
              labelName: true,
              distributor: true,
              upc: true,
              catalogueNumber: true,
            },
          },
        },
      }),
      this.prisma.release.count({ where }),
    ]);

    const submissions = releases.map((release) => {
      // Get primary artist from releaseArtists relation
      const primaryArtist =
        release.releaseArtists.find((ra) => ra.role === 'Primary')?.artist
          ?.name ||
        release.releaseArtists[0]?.artist?.name ||
        'Unknown Artist';

      // Determine submission status
      let submissionStatus = 'Pending Review';
      if (release.status === 'Approved') {
        submissionStatus = 'Approved';
      } else if (release.status === 'Declined') {
        submissionStatus = 'Declined';
      }

      return {
        releaseId: release.releaseId,
        title: release.releaseTitle || 'Untitled',
        artist: primaryArtist,
        type: release.typeOfRelease || 'Single',
        trackCount: release.tracks.length,
        releaseDate: release.releaseDate,
        submittedAt: release.createdAt,
        status: submissionStatus,
        genre: release.genre,
        language: release.language,
      };
    });

    return successPaginatedResponse(
      submissions,
      { page, limit, total },
      'Submissions fetched successfully',
    );
  }

  /**
   * Get single release/submission details
   */
  @HandleError('Failed to get submission details', 'DistributionSubmission')
  async getSubmissionById(releaseId: string): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tracks: {
          include: {
            trackArtists: {
              include: { artist: { select: { name: true } } },
            },
          },
        },
        releaseArtists: {
          include: { artist: true },
        },
        splitSheetAgreements: {
          include: {
            contributors: true,
            recordLabel: true,
          },
        },
        backCatalogue: true,
        releaseTerritories: true,
      },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    // Get primary artist
    const primaryArtist =
      release.releaseArtists.find((ra) => ra.role === 'Primary')?.artist
        ?.name ||
      release.releaseArtists[0]?.artist?.name ||
      'Unknown Artist';

    // Format tracks using YOUR schema
    const tracks = release.tracks.map((track) => ({
      trackId: track.trackId,
      trackNumber: track.trackNumber,
      title: track.trackTitle,
      isrc: track.trackIsrc,
      genre: track.trackGenre,
      mix: track.trackMix,
      language: track.trackLanguage,
      explicit: track.explicitContent || false,
      publisher: track.trackPublisher,
      originalReleaseDate: track.originalReleaseDate,
      territoryRestrictions: track.territoryRestrictions,
      audioFileUrl: track.audioFileUrl,
      artists: track.trackArtists.map((ta) => ({
        name: ta.nameOnTrack || ta.artist?.name,
        type: ta.artistType,
        role: ta.songwriterRole,
      })),
    }));

    // Format artists
    const artists = release.releaseArtists.map((ra) => ({
      artistId: ra.artistId,
      name: ra.artist?.name,
      role: ra.role,
      email: ra.artist?.email,
    }));

    // Format contributors
    const contributors =
      release.splitSheetAgreements[0]?.contributors.map((c) => ({
        contributorId: c.contributorId,
        fullName: c.fullName,
        contribution: c.contribution,
        percentageSplit: Number(c.percentageSplit || 0),
        email: c.email,
        publisher: c.publisher,
      })) || [];

    // Get catalogue info
    const catalogue = release.backCatalogue[0];

    const submissionDetails = {
      releaseId: release.releaseId,
      releaseTitle: release.releaseTitle,
      typeOfRelease: release.typeOfRelease,
      primaryArtist,
      releaseDate: release.releaseDate,
      preOrderDate: release.preOrderDate,
      genre: release.genre,
      language: release.language,
      isExplicitContent: release.isExplicitContent,
      hasExternalRightsHolder: release.hasExternalRightsHolder,
      hasDolbyAtmosVersion: release.hasDolbyAtmosVersion,
      hasExtendedMixForDjStores: release.hasExtendedMixForDjStores,
      hasArtistOnSpotify: release.hasArtistOnSpotify,
      hasMusicVideo: release.hasMusicVideo,
      additionalDetails: release.additionalDetails,
      status: release.status || 'Pending',
      // Catalogue info
      labelName: catalogue?.labelName,
      distributor: catalogue?.distributor,
      upc: catalogue?.upc,
      catalogueNumber: catalogue?.catalogueNumber,
      releasePLine: catalogue?.releasePLine,
      releaseCLine: catalogue?.releaseCLine,
      // Related data
      tracks,
      artists,
      contributors,
      territories: release.releaseTerritories.map((rt) => rt.territory),
      submittedBy: release.user,
      submittedAt: release.createdAt,
    };

    return successResponse(
      submissionDetails,
      'Submission details fetched successfully',
    );
  }

  /**
   * Approve a release/submission
   */
  @HandleError('Failed to approve submission', 'DistributionSubmission')
  async approveSubmission(
    releaseId: string,
    note?: string,
  ): Promise<TResponse<any>> {
    this.logger.log(`approveSubmission called for ${releaseId} note=${note}`);
    try {
      const release = await this.prisma.release.findUnique({
        where: { releaseId },
      });

      if (!release) {
        throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
      }

      if (release.status === 'Approved') {
        throw new AppError(HttpStatus.CONFLICT, 'Release already approved');
      }

      // Update release status to Approved
      const updated = await this.prisma.release.update({
        where: { releaseId },
        data: {
          status: 'Approved',
          additionalDetails: note
            ? `Approved: ${note}`
            : release.additionalDetails,
        },
      });

      this.logger.log(`Release approved: ${releaseId}`);

      return successResponse(updated, 'Release approved successfully');
    } catch (error) {
      const e = error as any;
      this.logger.error(`Failed to approve release ${releaseId}: ${e?.message || e}`, {
        stack: e?.stack,
        name: e?.name,
      });
      // Fallback: try raw SQL update in case Prisma client update fails due to mapping/adapter issues
      try {
        const details = note ? `Approved: ${note}` : null;
        await (this.prisma as any).$executeRawUnsafe(
          'UPDATE releases SET status = $1, additional_details = $2 WHERE release_id = $3',
          'Approved',
          details,
          releaseId,
        );

        const refreshed = await this.prisma.release.findUnique({ where: { releaseId } });
        if (!refreshed) {
          throw new Error('Release not found after raw update');
        }

        this.logger.log(`Release approved via fallback SQL: ${releaseId}`);
        return successResponse(refreshed, 'Release approved (fallback)');
      } catch (rawErr) {
        const r = rawErr as any;
        this.logger.error(`Fallback raw update failed for release ${releaseId}: ${r?.message || r}`, {
          stack: r?.stack,
        });
        throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, `Failed to approve release: ${e?.message || r?.message || 'unknown error'}`);
      }
    }
  }

  /**
   * Decline a release/submission
   */
  @HandleError('Failed to decline submission', 'DistributionSubmission')
  async declineSubmission(
    releaseId: string,
    reason: string,
  ): Promise<TResponse<any>> {
    try {
      const release = await this.prisma.release.findUnique({
        where: { releaseId },
      });

      if (!release) {
        throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
      }

      // Update release status to Declined
      const updated = await this.prisma.release.update({
        where: { releaseId },
        data: {
          status: 'Declined',
          additionalDetails: `Declined: ${reason}`,
        },
      });

      this.logger.log(`Release declined: ${releaseId} - Reason: ${reason}`);

      return successResponse(updated, 'Release declined successfully');
    } catch (error) {
      this.logger.error(`Failed to decline release ${releaseId}`, error as any);
      throw error;
    }
  }
}
