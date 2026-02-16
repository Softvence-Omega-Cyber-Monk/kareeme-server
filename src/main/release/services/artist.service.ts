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
import { ArtistResponseDto, CreateArtistDto, UpdateArtistDto } from '../dto/artist.dto';

@Injectable()
export class ArtistService {
  private readonly logger = new Logger(ArtistService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create artist', 'Artist')
  async createArtist(
    userId: string,
    dto: CreateArtistDto,
  ): Promise<TResponse<ArtistResponseDto>> {
    // Check if artist with same name already exists for this user
    const existingArtist = await this.prisma.artist.findFirst({
      where: {
        userId,
        name: dto.name,
      },
    });

    if (existingArtist) {
      throw new AppError(
        HttpStatus.CONFLICT,
        `Artist with name "${dto.name}" already exists`,
      );
    }

    const artist = await this.prisma.artist.create({
      data: {
        userId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        stageName: dto.stageName,
        bio: dto.bio,
        imageUrl: dto.imageUrl,
        spotifyId: dto.spotifyId,
        appleId: dto.appleId,
      },
    });

    this.logger.log(`Artist created: ${artist.artistId} by user ${userId}`);

    return successResponse(
      artist as any,
      'Artist created successfully',
    );
  }

  @HandleError('Failed to find or create artist', 'Artist')
  async findOrCreateArtist(
    userId: string,
    artistData: CreateArtistDto,
  ): Promise<any> {
    // Try to find existing artist by name
    let artist = await this.prisma.artist.findFirst({
      where: {
        userId,
        name: artistData.name,
      },
    });

    // If not found, create new artist
    if (!artist) {
      artist = await this.prisma.artist.create({
        data: {
          userId,
          name: artistData.name,
          email: artistData.email,
          phone: artistData.phone,
          stageName: artistData.stageName,
          bio: artistData.bio,
          imageUrl: artistData.imageUrl,
          spotifyId: artistData.spotifyId,
          appleId: artistData.appleId,
        },
      });

      this.logger.log(
        `Auto-created artist: ${artist.artistId} (${artist.name}) for user ${userId}`,
      );
    }

    return artist;
  }

  @HandleError('Failed to get artists', 'Artist')
  async getArtists(
    userId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ArtistResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ArtistWhereInput = {
      userId,
    };

    const [artists, total] = await this.prisma.$transaction([
      this.prisma.artist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artist.count({ where }),
    ]);

    return successPaginatedResponse(
      artists as any,
      { page, limit, total },
      'Artists fetched successfully',
    );
  }

  @HandleError('Failed to get artist', 'Artist')
  async getArtistById(
    userId: string,
    artistId: string,
  ): Promise<TResponse<ArtistResponseDto>> {
    const artist = await this.prisma.artist.findUnique({
      where: { artistId, userId },
    });

    if (!artist) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Artist not found');
    }

    return successResponse(
      artist as any,
      'Artist fetched successfully',
    );
  }

  @HandleError('Failed to update artist', 'Artist')
  async updateArtist(
    userId: string,
    artistId: string,
    dto: UpdateArtistDto,
  ): Promise<TResponse<ArtistResponseDto>> {
    const existingArtist = await this.prisma.artist.findUnique({
      where: { artistId, userId },
    });

    if (!existingArtist) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Artist not found');
    }

    // Check for name conflict if name is being updated
    if (dto.name && dto.name !== existingArtist.name) {
      const conflictingArtist = await this.prisma.artist.findFirst({
        where: {
          userId,
          name: dto.name,
          artistId: { not: artistId },
        },
      });

      if (conflictingArtist) {
        throw new AppError(
          HttpStatus.CONFLICT,
          `Artist with name "${dto.name}" already exists`,
        );
      }
    }

    const artist = await this.prisma.artist.update({
      where: { artistId, userId },
      data: dto,
    });

    this.logger.log(`Artist updated: ${artistId} by user ${userId}`);

    return successResponse(
      artist as any,
      'Artist updated successfully',
    );
  }

  @HandleError('Failed to get all artists for admin/distributor', 'Artist')
  async getAllArtistsForAdmin(
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ArtistResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const [artists, total] = await this.prisma.$transaction([
      this.prisma.artist.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.artist.count(),
    ]);

    return successPaginatedResponse(
      artists as any,
      { page, limit, total },
      'Artists fetched successfully',
    );
  }

  @HandleError('Failed to get artist for admin/distributor', 'Artist')
  async getArtistByIdForAdmin(
    artistId: string,
  ): Promise<TResponse<ArtistResponseDto>> {
    const artist = await this.prisma.artist.findUnique({
      where: { artistId },
    });

    if (!artist) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Artist not found');
    }

    return successResponse(
      artist as any,
      'Artist fetched successfully',
    );
  }

  @HandleError('Failed to update artist for admin/distributor', 'Artist')
  async updateArtistForAdmin(
    artistId: string,
    dto: UpdateArtistDto,
  ): Promise<TResponse<ArtistResponseDto>> {
    const existingArtist = await this.prisma.artist.findUnique({
      where: { artistId },
    });

    if (!existingArtist) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Artist not found');
    }

    if (dto.name && dto.name !== existingArtist.name) {
      const conflictingArtist = await this.prisma.artist.findFirst({
        where: {
          userId: existingArtist.userId,
          name: dto.name,
          artistId: { not: artistId },
        },
      });

      if (conflictingArtist) {
        throw new AppError(
          HttpStatus.CONFLICT,
          `Artist with name "${dto.name}" already exists`,
        );
      }
    }

    const artist = await this.prisma.artist.update({
      where: { artistId },
      data: dto,
    });

    this.logger.log(`Artist updated by admin: ${artistId}`);

    return successResponse(
      artist as any,
      'Artist updated successfully',
    );
  }

  @HandleError('Failed to delete artist', 'Artist')
  async deleteArtist(
    userId: string,
    artistId: string,
  ): Promise<TResponse<any>> {
    const artist = await this.prisma.artist.findUnique({
      where: { artistId, userId },
    });

    if (!artist) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Artist not found');
    }

    // Check if artist is used in any releases
    const releaseCount = await this.prisma.releaseArtist.count({
      where: { artistId },
    });

    if (releaseCount > 0) {
      throw new AppError(
        HttpStatus.CONFLICT,
        `Cannot delete artist. Artist is associated with ${releaseCount} release(s)`,
      );
    }

    // Check if artist is used in any tracks
    const trackCount = await this.prisma.trackArtist.count({
      where: { artistId },
    });

    if (trackCount > 0) {
      throw new AppError(
        HttpStatus.CONFLICT,
        `Cannot delete artist. Artist is associated with ${trackCount} track(s)`,
      );
    }

    await this.prisma.artist.delete({
      where: { artistId, userId },
    });

    this.logger.log(`Artist deleted: ${artistId} by user ${userId}`);

    return successResponse(
      { artistId },
      'Artist deleted successfully',
    );
  }
}