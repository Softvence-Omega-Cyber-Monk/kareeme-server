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
export class BackCatalogueService {
  private readonly logger = new Logger(BackCatalogueService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create back catalogue', 'BackCatalogue')
  async createBackCatalogue(
    distributorId: string,
    dto: any,
  ): Promise<TResponse<any>> {
    // BackCatalogue model requires releaseId, not distributorId
    // We'll create it linked to a release
    const backCatalogue = await this.prisma.backCatalogue.create({
      data: {
        releaseId: dto.releaseId, // Must provide releaseId
        labelName: dto.label,
        distributor: distributorId,
        releaseArtist: dto.artistName,
        releaseType: dto.releaseTypes,
        catalogueNumber: dto.catalogueNumber || 'AUTO-' + Date.now(),
        upc: dto.upc,
      },
    });

    return successResponse(
      backCatalogue,
      'Back catalogue created successfully',
    );
  }

  @HandleError('Failed to get back catalogues', 'BackCatalogue')
  async getBackCatalogues(
    distributorId: string,
    pg: any,
  ): Promise<TPaginatedResponse<any>> {
    const page = pg?.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg?.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.backCatalogue.findMany({
        where: { distributor: distributorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          release: {
            include: {
              tracks: true,
            },
          },
        },
      }),
      this.prisma.backCatalogue.count({ where: { distributor: distributorId } }),
    ]);

    return successPaginatedResponse(
      items,
      { page, limit, total },
      'Back catalogues fetched successfully',
    );
  }

  @HandleError('Failed to get back catalogue', 'BackCatalogue')
  async getBackCatalogueById(
    distributorId: string,
    catalogueId: string,
  ): Promise<TResponse<any>> {
    const backCatalogue = await this.prisma.backCatalogue.findFirst({
      where: { catalogueId, distributor: distributorId },
      include: {
        release: {
          include: {
            tracks: true,
            releaseArtists: {
              include: { artist: true },
            },
          },
        },
      },
    });

    return successResponse(
      backCatalogue,
      'Back catalogue fetched successfully',
    );
  }
}