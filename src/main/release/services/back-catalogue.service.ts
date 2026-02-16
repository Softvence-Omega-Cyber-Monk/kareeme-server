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
  UpdateBackCatalogueDto,
} from '../dto/back-catalogue.dto';

@Injectable()
export class BackCatalogueService {
  private readonly logger = new Logger(BackCatalogueService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create back catalogue entry', 'BackCatalogue')
  async createBackCatalogue(
    userId: string,
    dto: CreateBackCatalogueDto,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    // Verify the release belongs to the user
    const release = await this.prisma.release.findUnique({
      where: { releaseId: dto.releaseId, userId },
    });

    if (!release) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'Release not found or does not belong to you',
      );
    }

    const backCatalogue = await this.prisma.backCatalogue.create({
      data: {
        releaseId: dto.releaseId,
        labelName: dto.labelName,
        distributor: dto.distributor,
        upc: dto.upc,
        catalogueNumber: dto.catalogueNumber,
        releaseArtist: dto.releaseArtist,
        releaseTitle: dto.releaseTitle,
        releaseType: dto.releaseType,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        releasePLine: dto.releasePLine,
        releaseCLine: dto.releaseCLine,
      },
    });

    this.logger.log(
      `Back catalogue created: ${backCatalogue.catalogueId} for release ${dto.releaseId}`,
    );

    return successResponse(
      backCatalogue as any,
      'Back catalogue entry created successfully',
    );
  }

  @HandleError('Failed to get back catalogue entries', 'BackCatalogue')
  async getBackCatalogues(
    userId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<BackCatalogueResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    // Get releases that belong to the user
    const where: Prisma.BackCatalogueWhereInput = {
      release: {
        userId,
      },
    };

    const [backCatalogues, total] = await this.prisma.$transaction([
      this.prisma.backCatalogue.findMany({
        where,
        skip,
        take: limit,
        include: {
          release: {
            select: {
              releaseId: true,
              releaseTitle: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.backCatalogue.count({ where }),
    ]);

    return successPaginatedResponse(
      backCatalogues as any,
      { page, limit, total },
      'Back catalogue entries fetched successfully',
    );
  }

  @HandleError('Failed to get back catalogue entry', 'BackCatalogue')
  async getBackCatalogueById(
    userId: string,
    catalogueId: string,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const backCatalogue = await this.prisma.backCatalogue.findUnique({
      where: { catalogueId },
      include: {
        release: true,
      },
    });

    if (!backCatalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue entry not found');
    }

    // Verify the back catalogue belongs to the user's release
    if (backCatalogue.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this back catalogue entry',
      );
    }

    return successResponse(
      backCatalogue as any,
      'Back catalogue entry fetched successfully',
    );
  }

  @HandleError('Failed to get release back catalogue', 'BackCatalogue')
  async getBackCataloguesByRelease(
    userId: string,
    releaseId: string,
  ): Promise<TResponse<BackCatalogueResponseDto[]>> {
    // Verify the release belongs to the user
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const backCatalogues = await this.prisma.backCatalogue.findMany({
      where: { releaseId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      backCatalogues as any,
      'Back catalogue entries fetched successfully',
    );
  }

  @HandleError('Failed to update back catalogue entry', 'BackCatalogue')
  async updateBackCatalogue(
    userId: string,
    catalogueId: string,
    dto: UpdateBackCatalogueDto,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const existingBackCatalogue = await this.prisma.backCatalogue.findUnique({
      where: { catalogueId },
      include: { release: true },
    });

    if (!existingBackCatalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue entry not found');
    }

    // Verify the back catalogue belongs to the user's release
    if (existingBackCatalogue.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this back catalogue entry',
      );
    }

    const backCatalogue = await this.prisma.backCatalogue.update({
      where: { catalogueId },
      data: {
        ...dto,
        ...(dto.releaseDate && {
          releaseDate: new Date(dto.releaseDate),
        }),
      },
    });

    this.logger.log(
      `Back catalogue updated: ${catalogueId} by user ${userId}`,
    );

    return successResponse(
      backCatalogue as any,
      'Back catalogue entry updated successfully',
    );
  }

  @HandleError('Failed to get all back catalogue entries for admin/distributor', 'BackCatalogue')
  async getAllBackCataloguesForAdmin(
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<BackCatalogueResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const [backCatalogues, total] = await this.prisma.$transaction([
      this.prisma.backCatalogue.findMany({
        skip,
        take: limit,
        include: {
          release: {
            select: {
              releaseId: true,
              releaseTitle: true,
              userId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.backCatalogue.count(),
    ]);

    return successPaginatedResponse(
      backCatalogues as any,
      { page, limit, total },
      'Back catalogue entries fetched successfully',
    );
  }

  @HandleError('Failed to get back catalogue entry for admin/distributor', 'BackCatalogue')
  async getBackCatalogueByIdForAdmin(
    catalogueId: string,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const backCatalogue = await this.prisma.backCatalogue.findUnique({
      where: { catalogueId },
      include: {
        release: true,
      },
    });

    if (!backCatalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue entry not found');
    }

    return successResponse(
      backCatalogue as any,
      'Back catalogue entry fetched successfully',
    );
  }

  @HandleError('Failed to update back catalogue entry for admin/distributor', 'BackCatalogue')
  async updateBackCatalogueForAdmin(
    catalogueId: string,
    dto: UpdateBackCatalogueDto,
  ): Promise<TResponse<BackCatalogueResponseDto>> {
    const existingBackCatalogue = await this.prisma.backCatalogue.findUnique({
      where: { catalogueId },
    });

    if (!existingBackCatalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue entry not found');
    }

    const backCatalogue = await this.prisma.backCatalogue.update({
      where: { catalogueId },
      data: {
        ...dto,
        ...(dto.releaseDate && {
          releaseDate: new Date(dto.releaseDate),
        }),
      },
    });

    this.logger.log(`Back catalogue updated by admin: ${catalogueId}`);

    return successResponse(
      backCatalogue as any,
      'Back catalogue entry updated successfully',
    );
  }

  @HandleError('Failed to delete back catalogue entry', 'BackCatalogue')
  async deleteBackCatalogue(
    userId: string,
    catalogueId: string,
  ): Promise<TResponse<any>> {
    const backCatalogue = await this.prisma.backCatalogue.findUnique({
      where: { catalogueId },
      include: { release: true },
    });

    if (!backCatalogue) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Back catalogue entry not found');
    }

    // Verify the back catalogue belongs to the user's release
    if (backCatalogue.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this back catalogue entry',
      );
    }

    await this.prisma.backCatalogue.delete({
      where: { catalogueId },
    });

    this.logger.log(
      `Back catalogue deleted: ${catalogueId} by user ${userId}`,
    );

    return successResponse(
      { catalogueId },
      'Back catalogue entry deleted successfully',
    );
  }
}
