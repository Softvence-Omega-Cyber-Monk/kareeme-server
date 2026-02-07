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
import { AssetResponseDto, CreateAssetDto } from './dto/asset.dto';
import {
  ClaimResponseDto,
  CreateClaimDto,
  CreateGeoTrendDto,
  GeoTrendResponseDto,
  UpdateClaimDto,
} from './dto/geo-claim.dto';
import { Platform } from './dto/platform.dto';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create asset', 'Asset')
  async createAsset(
    userId: string,
    dto: CreateAssetDto,
  ): Promise<TResponse<AssetResponseDto>> {
    const asset = await this.prisma.asset.create({
      data: {
        userId,
        title: dto.title,
        artist: dto.artist,
        platform: dto.platform,
        assetType: dto.assetType,
        thumbnailUrl: dto.thumbnailUrl,
        publishedDate: dto.publishedDate
          ? new Date(dto.publishedDate)
          : undefined,
        totalViews: dto.totalViews || 0,
        adSupported: dto.adSupported || 0,
        youtubePremium: dto.youtubePremium || 0,
        totalEarnings: dto.totalEarnings || 0,
        releaseId: dto.releaseId,
        trackId: dto.trackId,
      },
    });

    this.logger.log(`Asset created: ${asset.assetId} - ${asset.title}`);

    return successResponse(asset as any, 'Asset created successfully');
  }

  @HandleError('Failed to get assets', 'Asset')
  async getAssets(
    userId: string,
    platform: Platform | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<AssetResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      userId,
      ...(platform && { platform }),
    };

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalEarnings: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return successPaginatedResponse(
      assets as any,
      { page, limit, total },
      'Assets fetched successfully',
    );
  }

  @HandleError('Failed to delete asset', 'Asset')
  async deleteAsset(userId: string, assetId: string): Promise<TResponse<any>> {
    const asset = await this.prisma.asset.findUnique({
      where: { assetId, userId },
    });

    if (!asset) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Asset not found');
    }

    await this.prisma.asset.delete({
      where: { assetId, userId },
    });

    this.logger.log(`Asset deleted: ${assetId} by user ${userId}`);

    return successResponse({ assetId }, 'Asset deleted successfully');
  }
}

@Injectable()
export class GeoTrendService {
  private readonly logger = new Logger(GeoTrendService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create geo trend', 'GeoTrend')
  async createGeoTrend(
    userId: string,
    dto: CreateGeoTrendDto,
  ): Promise<TResponse<GeoTrendResponseDto>> {
    const date = new Date(dto.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Check if exists
    const existing = await this.prisma.geoTrend.findUnique({
      where: {
        userId_platform_country_region_date: {
          userId,
          platform: dto.platform,
          country: dto.country,
          region: dto.region!,
          date,
        },
      },
    });

    if (existing) {
      // Update existing
      const updated = await this.prisma.geoTrend.update({
        where: { geoTrendId: existing.geoTrendId },
        data: {
          views: dto.views ?? existing.views,
          earnings: dto.earnings ?? existing.earnings,
        },
      });

      return successResponse(
        updated as any,
        'Geo trend updated successfully',
      );
    }

    const geoTrend = await this.prisma.geoTrend.create({
      data: {
        userId,
        platform: dto.platform,
        country: dto.country,
        region: dto.region,
        date,
        month,
        year,
        views: dto.views || 0,
        earnings: dto.earnings || 0,
      },
    });

    this.logger.log(
      `Geo trend created: ${geoTrend.geoTrendId} for ${dto.country}`,
    );

    return successResponse(geoTrend as any, 'Geo trend created successfully');
  }

  @HandleError('Failed to get geo trends', 'GeoTrend')
  async getGeoTrends(
    userId: string,
    platform: Platform | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<GeoTrendResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GeoTrendWhereInput = {
      userId,
      ...(platform && { platform }),
    };

    const [geoTrends, total] = await this.prisma.$transaction([
      this.prisma.geoTrend.findMany({
        where,
        skip,
        take: limit,
        orderBy: { earnings: 'desc' },
      }),
      this.prisma.geoTrend.count({ where }),
    ]);

    return successPaginatedResponse(
      geoTrends as any,
      { page, limit, total },
      'Geo trends fetched successfully',
    );
  }
}

@Injectable()
export class ClaimService {
  private readonly logger = new Logger(ClaimService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create claim', 'Claim')
  async createClaim(
    userId: string,
    dto: CreateClaimDto,
  ): Promise<TResponse<ClaimResponseDto>> {
    const claim = await this.prisma.claim.create({
      data: {
        userId,
        title: dto.title,
        claimant: dto.claimant,
        platform: dto.platform,
        status: dto.status || 'Pending',
        thumbnailUrl: dto.thumbnailUrl,
        publishedDate: dto.publishedDate
          ? new Date(dto.publishedDate)
          : undefined,
        description: dto.description,
        views: dto.views || 0,
        adSupported: dto.adSupported || 0,
        youtubePremium: dto.youtubePremium || 0,
        totalEarnings: dto.totalEarnings || 0,
        claimedDate: dto.claimedDate ? new Date(dto.claimedDate) : undefined,
      },
    });

    this.logger.log(`Claim created: ${claim.claimId} - ${claim.title}`);

    return successResponse(claim as any, 'Claim created successfully');
  }

  @HandleError('Failed to get claims', 'Claim')
  async getClaims(
    userId: string,
    platform: Platform | null,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ClaimResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClaimWhereInput = {
      userId,
      ...(platform && { platform }),
    };

    const [claims, total] = await this.prisma.$transaction([
      this.prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);

    return successPaginatedResponse(
      claims as any,
      { page, limit, total },
      'Claims fetched successfully',
    );
  }

  @HandleError('Failed to update claim', 'Claim')
  async updateClaim(
    userId: string,
    claimId: string,
    dto: UpdateClaimDto,
  ): Promise<TResponse<ClaimResponseDto>> {
    const existing = await this.prisma.claim.findUnique({
      where: { claimId, userId },
    });

    if (!existing) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Claim not found');
    }

    const claim = await this.prisma.claim.update({
      where: { claimId, userId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.resolvedDate && { resolvedDate: new Date(dto.resolvedDate) }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    this.logger.log(`Claim updated: ${claimId} by user ${userId}`);

    return successResponse(claim as any, 'Claim updated successfully');
  }

  @HandleError('Failed to delete claim', 'Claim')
  async deleteClaim(userId: string, claimId: string): Promise<TResponse<any>> {
    const claim = await this.prisma.claim.findUnique({
      where: { claimId, userId },
    });

    if (!claim) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Claim not found');
    }

    await this.prisma.claim.delete({
      where: { claimId, userId },
    });

    this.logger.log(`Claim deleted: ${claimId} by user ${userId}`);

    return successResponse({ claimId }, 'Claim deleted successfully');
  }
}
