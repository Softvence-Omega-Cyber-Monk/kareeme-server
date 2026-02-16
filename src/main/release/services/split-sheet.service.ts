import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  CreateSplitSheetDto,
  SplitSheetResponseDto,
  UpdateSplitSheetDto,
} from '../dto/split-sheet.dto';

@Injectable()
export class SplitSheetService {
  private readonly logger = new Logger(SplitSheetService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create split sheet', 'SplitSheet')
  async createSplitSheet(
    userId: string,
    dto: CreateSplitSheetDto,
  ): Promise<TResponse<SplitSheetResponseDto>> {
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

    // Validate that splits total 100%
    const totalSplit = dto.contributors.reduce(
      (sum, contributor) => sum + Number(contributor.percentageSplit),
      0,
    );

    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `Contributor splits must total 100%. Current total: ${totalSplit}%`,
      );
    }

    const { contributors, ...splitSheetData } = dto;

    // Create split sheet with contributors
    const splitSheet = await this.prisma.splitSheetAgreement.create({
      data: {
        releaseId: dto.releaseId,
        songTitle: splitSheetData.songTitle,
        isrc: splitSheetData.isrc,
        releaseDate: splitSheetData.releaseDate
          ? new Date(splitSheetData.releaseDate)
          : undefined,
        recordLabelId: splitSheetData.recordLabelId,
        contributors: {
          create: contributors.map((contributor) => ({
            fullName: contributor.fullName,
            contribution: contributor.contribution,
            email: contributor.email,
            phone: contributor.phone,
            address: contributor.address,
            publisher: contributor.publisher,
            affiliation: contributor.affiliation,
            ipiCaeNumber: contributor.ipiCaeNumber,
            percentageSplit: contributor.percentageSplit,
          })),
        },
      },
      include: {
        contributors: true,
        recordLabel: true,
      },
    });

    this.logger.log(
      `Split sheet created: ${splitSheet.splitId} for release ${dto.releaseId}`,
    );

    return successResponse(
      splitSheet as any,
      'Split sheet created successfully',
    );
  }

  @HandleError('Failed to get split sheet', 'SplitSheet')
  async getSplitSheetById(
    userId: string,
    splitId: string,
  ): Promise<TResponse<SplitSheetResponseDto>> {
    const splitSheet = await this.prisma.splitSheetAgreement.findUnique({
      where: { splitId },
      include: {
        release: true,
        contributors: true,
        recordLabel: true,
      },
    });

    if (!splitSheet) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Split sheet not found');
    }

    // Verify the split sheet belongs to the user's release
    if (splitSheet.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this split sheet',
      );
    }

    return successResponse(
      splitSheet as any,
      'Split sheet fetched successfully',
    );
  }

  @HandleError('Failed to get all split sheets', 'SplitSheet')
async getAllSplitSheets(): Promise<TResponse<SplitSheetResponseDto[]>> {
  const splitSheets = await this.prisma.splitSheetAgreement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(
    splitSheets as any,
    'All split sheets fetched successfully',
  );
}


  @HandleError('Failed to get release split sheets', 'SplitSheet')
  async getSplitSheetsByRelease(
    userId: string,
    releaseId: string,
  ): Promise<TResponse<SplitSheetResponseDto[]>> {
    // Verify the release belongs to the user
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const splitSheets = await this.prisma.splitSheetAgreement.findMany({
      where: { releaseId },
      include: {
        contributors: true,
        recordLabel: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(
      splitSheets as any,
      'Split sheets fetched successfully',
    );
  }

  @HandleError('Failed to update split sheet', 'SplitSheet')
  async updateSplitSheet(
    userId: string,
    splitId: string,
    dto: UpdateSplitSheetDto,
  ): Promise<TResponse<SplitSheetResponseDto>> {
    const existingSplitSheet = await this.prisma.splitSheetAgreement.findUnique(
      {
        where: { splitId },
        include: { release: true },
      },
    );

    if (!existingSplitSheet) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Split sheet not found');
    }

    // Verify the split sheet belongs to the user's release
    if (existingSplitSheet.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this split sheet',
      );
    }

    // Validate that splits total 100% if contributors are being updated
    if (dto.contributors) {
      const totalSplit = dto.contributors.reduce(
        (sum, contributor) => sum + Number(contributor.percentageSplit),
        0,
      );

      if (Math.abs(totalSplit - 100) > 0.01) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          `Contributor splits must total 100%. Current total: ${totalSplit}%`,
        );
      }
    }

    const { contributors, ...splitSheetData } = dto;

    // Update split sheet
    const splitSheet = await this.prisma.splitSheetAgreement.update({
      where: { splitId },
      data: {
        ...splitSheetData,
        ...(dto.releaseDate && {
          releaseDate: new Date(dto.releaseDate),
        }),
      },
      include: {
        contributors: true,
        recordLabel: true,
      },
    });

    // Update contributors if provided
    if (contributors) {
      await this.prisma.contributor.deleteMany({
        where: { splitId },
      });

      await this.prisma.contributor.createMany({
        data: contributors.map((contributor) => ({
          splitId,
          fullName: contributor.fullName,
          contribution: contributor.contribution,
          email: contributor.email,
          phone: contributor.phone,
          address: contributor.address,
          publisher: contributor.publisher,
          affiliation: contributor.affiliation,
          ipiCaeNumber: contributor.ipiCaeNumber,
          percentageSplit: contributor.percentageSplit,
        })),
      });
    }

    this.logger.log(`Split sheet updated: ${splitId} by user ${userId}`);

    return successResponse(
      splitSheet as any,
      'Split sheet updated successfully',
    );
  }

  @HandleError('Failed to get all split sheets for admin/distributor', 'SplitSheet')
  async getAllSplitSheetsForAdmin(
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<SplitSheetResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const [splitSheets, total] = await this.prisma.$transaction([
      this.prisma.splitSheetAgreement.findMany({
        skip,
        take: limit,
        include: {
          contributors: true,
          recordLabel: true,
          release: { select: { releaseId: true, releaseTitle: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.splitSheetAgreement.count(),
    ]);

    return successPaginatedResponse(
      splitSheets as any,
      { page, limit, total },
      'Split sheets fetched successfully',
    );
  }

  @HandleError('Failed to get split sheet for admin/distributor', 'SplitSheet')
  async getSplitSheetByIdForAdmin(
    splitId: string,
  ): Promise<TResponse<SplitSheetResponseDto>> {
    const splitSheet = await this.prisma.splitSheetAgreement.findUnique({
      where: { splitId },
      include: {
        release: true,
        contributors: true,
        recordLabel: true,
      },
    });

    if (!splitSheet) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Split sheet not found');
    }

    return successResponse(
      splitSheet as any,
      'Split sheet fetched successfully',
    );
  }

  @HandleError('Failed to update split sheet for admin/distributor', 'SplitSheet')
  async updateSplitSheetForAdmin(
    splitId: string,
    dto: UpdateSplitSheetDto,
  ): Promise<TResponse<SplitSheetResponseDto>> {
    const existingSplitSheet = await this.prisma.splitSheetAgreement.findUnique(
      {
        where: { splitId },
      },
    );

    if (!existingSplitSheet) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Split sheet not found');
    }

    if (dto.contributors) {
      const totalSplit = dto.contributors.reduce(
        (sum, contributor) => sum + Number(contributor.percentageSplit),
        0,
      );

      if (Math.abs(totalSplit - 100) > 0.01) {
        throw new AppError(
          HttpStatus.BAD_REQUEST,
          `Contributor splits must total 100%. Current total: ${totalSplit}%`,
        );
      }
    }

    const { contributors, ...splitSheetData } = dto;

    const splitSheet = await this.prisma.splitSheetAgreement.update({
      where: { splitId },
      data: {
        ...splitSheetData,
        ...(dto.releaseDate && {
          releaseDate: new Date(dto.releaseDate),
        }),
      },
      include: {
        contributors: true,
        recordLabel: true,
      },
    });

    if (contributors) {
      await this.prisma.contributor.deleteMany({
        where: { splitId },
      });

      await this.prisma.contributor.createMany({
        data: contributors.map((contributor) => ({
          splitId,
          fullName: contributor.fullName,
          contribution: contributor.contribution,
          email: contributor.email,
          phone: contributor.phone,
          address: contributor.address,
          publisher: contributor.publisher,
          affiliation: contributor.affiliation,
          ipiCaeNumber: contributor.ipiCaeNumber,
          percentageSplit: contributor.percentageSplit,
        })),
      });
    }

    this.logger.log(`Split sheet updated by admin: ${splitId}`);

    const updatedSplitSheet = await this.prisma.splitSheetAgreement.findUnique({
      where: { splitId },
      include: {
        contributors: true,
        recordLabel: true,
      },
    });

    return successResponse(
      updatedSplitSheet as any,
      'Split sheet updated successfully',
    );
  }

  @HandleError('Failed to delete split sheet', 'SplitSheet')
  async deleteSplitSheet(
    userId: string,
    splitId: string,
  ): Promise<TResponse<any>> {
    const splitSheet = await this.prisma.splitSheetAgreement.findUnique({
      where: { splitId },
      include: { release: true },
    });

    if (!splitSheet) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Split sheet not found');
    }

    // Verify the split sheet belongs to the user's release
    if (splitSheet.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this split sheet',
      );
    }

    await this.prisma.splitSheetAgreement.delete({
      where: { splitId },
    });

    this.logger.log(`Split sheet deleted: ${splitId} by user ${userId}`);

    return successResponse(
      { splitId },
      'Split sheet deleted successfully',
    );
  }
}
