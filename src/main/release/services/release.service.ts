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
  CreateReleaseDto,
} from '../dto/create-release.dto';
import { ReleaseListItemDto, ReleaseResponseDto } from '../dto/release-response.dto';
import { UpdateReleaseDto } from '../dto/update-release.dto';
import { ArtistService } from './artist.service';

@Injectable()
export class ReleaseService {
  private readonly logger = new Logger(ReleaseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly artistService: ArtistService,
  ) {}

  @HandleError('Failed to create release', 'Release')
  async createRelease(
    userId: string,
    dto: CreateReleaseDto,
  ): Promise<TResponse<ReleaseResponseDto>> {
    const { artists, territories, ...releaseData } = dto;

    // Process artists - auto-create if needed
    let artistRelations: Array<{ artistId: string; role?: string }> = [];

    if (artists && artists.length > 0) {
      for (const artistData of artists) {
        let artistId: string;

        if (artistData.artistId) {
          // Use existing artist ID - verify it exists
          const existingArtist = await this.prisma.artist.findUnique({
            where: { artistId: artistData.artistId, userId },
          });

          if (!existingArtist) {
            throw new AppError(
              HttpStatus.NOT_FOUND,
              `Artist with ID ${artistData.artistId} not found`,
            );
          }

          artistId = artistData.artistId;
        } else if (artistData.name) {
          // Auto-create artist with the provided name
          const artist = await this.artistService.findOrCreateArtist(userId, {
            name: artistData.name,
            email: artistData.email,
            phone: artistData.phone,
            stageName: artistData.stageName,
            spotifyId: artistData.spotifyId,
            appleId: artistData.appleId,
          });

          artistId = artist.artistId;
          this.logger.log(
            `Using artist: ${artistId} (${artist.name}) for release`,
          );
        } else {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            'Each artist must have either artistId or name',
          );
        }

        artistRelations.push({
          artistId,
          role: artistData.role,
        });
      }
    }

    // Create release with nested relations
    const release = await this.prisma.release.create({
      data: {
        userId,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        preOrderDate: dto.preOrderDate
          ? new Date(dto.preOrderDate)
          : undefined,
        releaseTitle: releaseData.releaseTitle,
        typeOfRelease: releaseData.typeOfRelease,
        genre: releaseData.genre,
        producerCredits: releaseData.producerCredits,
        lyricistCredits: releaseData.lyricistCredits,
        masterSplits: releaseData.masterSplits,
        copyrightHolder: releaseData.copyrightHolder,
        labelName: releaseData.labelName,
        albumLevelArtistName: releaseData.albumLevelArtistName,
        musicFileLink: releaseData.musicFileLink ?? null,
        language: releaseData.language,
        isExplicitContent: releaseData.isExplicitContent,
        hasExternalRightsHolder: releaseData.hasExternalRightsHolder,
        hasDolbyAtmosVersion: releaseData.hasDolbyAtmosVersion,
        hasExtendedMixForDjStores: releaseData.hasExtendedMixForDjStores,
        additionalDetails: releaseData.additionalDetails,
        hasArtistOnSpotify: releaseData.hasArtistOnSpotify,
        hasMusicVideo: releaseData.hasMusicVideo,
        status: releaseData.status || 'Draft',
        ...(artistRelations.length > 0 && {
          releaseArtists: {
            create: artistRelations.map((artist) => ({
              artistId: artist.artistId,
              role: artist.role,
            })),
          },
        }),
        ...(territories && {
          releaseTerritories: {
            create: territories.map((territory) => ({
              territory: territory.territory,
            })),
          },
        }),
      },
      include: {
        releaseArtists: {
          include: {
            artist: true,
          },
        },
        releaseTerritories: true,
        tracks: true,
      },
    });

    this.logger.log(`Release created: ${release.releaseId} by user ${userId}`);

    return successResponse(
      release as any,
      'Release created successfully',
    );
  }

  @HandleError('Failed to get releases', 'Release')
  async getReleases(
    userId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ReleaseListItemDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReleaseWhereInput = {
      userId,
    };

    const [releases, total] = await this.prisma.$transaction([
      this.prisma.release.findMany({
        where,
        skip,
        take: limit,
        include: {
          releaseArtists: {
            include: {
              artist: true,
            },
          },
          backCatalogue: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.release.count({ where }),
    ]);

    // Transform to list items
    const listItems: ReleaseListItemDto[] = releases.map((release) => ({
      releaseId: release.releaseId,
      releaseTitle: release.releaseTitle ?? undefined,
      typeOfRelease: release.typeOfRelease ?? undefined,
      releaseDate: release.releaseDate
        ? release.releaseDate.toISOString().split('T')[0]
        : undefined,
      status: release.status ?? undefined,
      upc: release.backCatalogue?.[0]?.upc ?? undefined,
      artistName: release.releaseArtists?.[0]?.artist?.name ?? undefined,
      createdAt: release.createdAt,
    }));

    return successPaginatedResponse(
      listItems,
      { page, limit, total },
      'Releases fetched successfully',
    );
  }

  @HandleError('Failed to get release', 'Release')
  async getReleaseById(
    userId: string,
    releaseId: string,
  ): Promise<TResponse<ReleaseResponseDto>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
      include: {
        releaseArtists: {
          include: {
            artist: true,
          },
        },
        releaseTerritories: true,
        tracks: {
          include: {
            trackArtists: {
              include: {
                artist: true,
              },
            },
          },
          orderBy: { trackNumber: 'asc' },
        },
        splitSheetAgreements: {
          include: {
            contributors: true,
            recordLabel: true,
          },
        },
        backCatalogue: true,
      },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    return successResponse(
      release as any,
      'Release fetched successfully',
    );
  }

  @HandleError('Failed to update release', 'Release')
  async updateRelease(
    userId: string,
    releaseId: string,
    dto: UpdateReleaseDto,
  ): Promise<TResponse<ReleaseResponseDto>> {
    // Check if release exists and belongs to user
    const existingRelease = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!existingRelease) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const { artists, territories, ...releaseData } = dto;

    // Update release
    const release = await this.prisma.release.update({
      where: { releaseId, userId },
      data: {
        ...(dto.releaseDate && { releaseDate: new Date(dto.releaseDate) }),
        ...(dto.preOrderDate && { preOrderDate: new Date(dto.preOrderDate) }),
        ...releaseData,
      },
      include: {
        releaseArtists: {
          include: {
            artist: true,
          },
        },
        releaseTerritories: true,
        tracks: true,
      },
    });

    // Update artists if provided
    if (artists) {
      // Delete existing relations
      await this.prisma.releaseArtist.deleteMany({
        where: { releaseId },
      });

      // Process and create new artist relations
      for (const artistData of artists) {
        let artistId: string;

        if (artistData.artistId) {
          // Verify artist exists
          const existingArtist = await this.prisma.artist.findUnique({
            where: { artistId: artistData.artistId, userId },
          });

          if (!existingArtist) {
            throw new AppError(
              HttpStatus.NOT_FOUND,
              `Artist with ID ${artistData.artistId} not found`,
            );
          }

          artistId = artistData.artistId;
        } else if (artistData.name) {
          // Auto-create artist
          const artist = await this.artistService.findOrCreateArtist(userId, {
            name: artistData.name,
            email: artistData.email,
            phone: artistData.phone,
            stageName: artistData.stageName,
            spotifyId: artistData.spotifyId,
            appleId: artistData.appleId,
          });

          artistId = artist.artistId;
        } else {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            'Each artist must have either artistId or name',
          );
        }

        await this.prisma.releaseArtist.create({
          data: {
            releaseId,
            artistId,
            role: artistData.role,
          },
        });
      }
    }

    // Update territories if provided
    if (territories) {
      await this.prisma.releaseTerritory.deleteMany({
        where: { releaseId },
      });

      await this.prisma.releaseTerritory.createMany({
        data: territories.map((territory) => ({
          releaseId,
          territory: territory.territory,
        })),
      });
    }

    this.logger.log(`Release updated: ${release.releaseId} by user ${userId}`);

    return successResponse(
      release as any,
      'Release updated successfully',
    );
  }

  @HandleError('Failed to delete release', 'Release')
  async deleteRelease(
    userId: string,
    releaseId: string,
  ): Promise<TResponse<any>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    await this.prisma.release.delete({
      where: { releaseId, userId },
    });

    this.logger.log(`Release deleted: ${releaseId} by user ${userId}`);

    return successResponse(
      { releaseId },
      'Release deleted successfully',
    );
  }

  @HandleError('Failed to update release status', 'Release')
  async updateReleaseStatus(
    userId: string,
    releaseId: string,
    status: string,
  ): Promise<TResponse<ReleaseResponseDto>> {
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const updatedRelease = await this.prisma.release.update({
      where: { releaseId, userId },
      data: { status },
      include: {
        releaseArtists: {
          include: {
            artist: true,
          },
        },
        releaseTerritories: true,
        tracks: true,
      },
    });

    this.logger.log(
      `Release status updated: ${releaseId} to ${status} by user ${userId}`,
    );

    return successResponse(
      updatedRelease as any,
      `Release status updated to ${status}`,
    );
  }
}