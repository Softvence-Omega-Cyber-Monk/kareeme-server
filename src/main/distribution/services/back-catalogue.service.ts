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
  BackCatalogueResponseDto,
  CreateBackCatalogueDto,
} from '../dto/back-catalogue.dto';

@Injectable()
export class BackCatalogueService {
  private readonly logger = new Logger(BackCatalogueService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create back catalogue', 'BackCatalogue')
  async createBackCatalogue(
    distributorId: string,
    dto: CreateBackCatalogueDto,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const catalogue = await this.prisma.clientBackCatalogue.create({
      data: {
        distributorId,
        userId: dto.userId,
        artistName: dto.artistName,
        genre: dto.genre,
        totalReleases: dto.totalReleases,
        releaseTypes: dto.releaseTypes,
        currentDistributor: dto.currentDistributor,
        label: dto.label,
        totalTracks: dto.totalTracks,
        dateRangeStart: dto.dateRangeStart
          ? new Date(dto.dateRangeStart)
          : undefined,
        dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : undefined,
      },
    });

    this.logger.log(
      `Back catalogue created: ${catalogue.catalogueId} for ${dto.artistName}`,
    );

    return successResponse(
      catalogue as any,
      'Back catalogue created successfully',
    );
  }

  @HandleError('Failed to get back catalogues', 'BackCatalogue')
  async getBackCatalogues(
    distributorId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<BackCatalogueResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientBackCatalogueWhereInput = {
      distributorId,
    };

    const [catalogues, total] = await this.prisma.$transaction([
      this.prisma.clientBackCatalogue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      this.prisma.clientBackCatalogue.count({ where }),
    ]);

    return successPaginatedResponse(
      catalogues as any,
      { page, limit, total },
      'Back catalogues fetched successfully',
    );
  }

  @HandleError('Failed to get back catalogue details', 'BackCatalogue')
  async getBackCatalogueById(
    distributorId: string,
    catalogueId: string,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const catalogue = await this.prisma.clientBackCatalogue.findUnique({
      where: { catalogueId, distributorId },
      include: {
        user: true,
      },
    });

    if (!catalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue not found');
    }

    return successResponse(
      catalogue as any,
      'Back catalogue fetched successfully',
    );
  }
}
