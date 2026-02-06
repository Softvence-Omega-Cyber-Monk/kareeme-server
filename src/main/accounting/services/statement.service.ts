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
  CreateStatementDto,
  StatementListItemDto,
  StatementResponseDto,
  StatementSummaryDto,
  UpdateStatementDto,
} from '../dto/statement.dto';
import { StatementDetailsDto } from '../dto/accounting-details.dto';

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create statement', 'Statement')
  async createStatement(
    userId: string,
    dto: CreateStatementDto,
  ): Promise<TResponse<StatementResponseDto>> {
    // Check if statement already exists for this month/year
    const existing = await this.prisma.statement.findUnique({
      where: {
        userId_statementMonth_statementYear: {
          userId,
          statementMonth: dto.statementMonth,
          statementYear: dto.statementYear,
        },
      },
    });

    if (existing) {
      throw new AppError(
        HttpStatus.CONFLICT,
        `Statement for ${dto.statementMonth}/${dto.statementYear} already exists`,
      );
    }

    const statement = await this.prisma.statement.create({
      data: {
        userId,
        statementMonth: dto.statementMonth,
        statementYear: dto.statementYear,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        issuedOn: dto.issuedOn ? new Date(dto.issuedOn) : undefined,
        openingBalance: dto.openingBalance || 0,
        totalEarnings: dto.totalEarnings || 0,
        totalExpenses: dto.totalExpenses || 0,
        payment: dto.payment || 0,
        closingBalance: dto.closingBalance || 0,
        status: dto.status || 'Pending',
        notes: dto.notes,
      },
    });

    this.logger.log(
      `Statement created: ${statement.statementId} for ${dto.statementMonth}/${dto.statementYear}`,
    );

    return successResponse(
      statement as any,
      'Statement created successfully',
    );
  }

  @HandleError('Failed to get statements', 'Statement')
  async getStatements(
    userId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<StatementListItemDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StatementWhereInput = { userId };

    const [statements, total] = await this.prisma.$transaction([
      this.prisma.statement.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ statementYear: 'desc' }, { statementMonth: 'desc' }],
      }),
      this.prisma.statement.count({ where }),
    ]);

    const listItems: StatementListItemDto[] = statements.map((stmt) => ({
      statementId: stmt.statementId,
      title: `Statement for ${this.getMonthName(stmt.statementMonth)} ${stmt.statementYear}`,
      subtitle: `${this.getMonthName(stmt.statementMonth).substring(0, 4)} ${stmt.statementMonth} Statement`,
      status: stmt.status as any,
      paymentAmount: stmt.payment.toString(),
      month: stmt.statementMonth,
      year: stmt.statementYear,
      createdAt: stmt.createdAt,
    }));

    return successPaginatedResponse(
      listItems,
      { page, limit, total },
      'Statements fetched successfully',
    );
  }

  @HandleError('Failed to get statement summaries', 'Statement')
  async getStatementSummaries(
    userId: string,
  ): Promise<TResponse<StatementSummaryDto[]>> {
    const summaries = await this.prisma.statement.groupBy({
      by: ['statementYear'],
      where: { userId },
      _sum: {
        payment: true,
      },
      _count: {
        statementId: true,
      },
      orderBy: {
        statementYear: 'desc',
      },
    });

    const result: StatementSummaryDto[] = summaries.map((summary) => ({
      year: summary.statementYear,
      totalAmount: (summary._sum.payment || 0).toString(),
      statementCount: summary._count.statementId,
    }));

    return successResponse(result, 'Statement summaries fetched successfully');
  }

  @HandleError('Failed to get statement', 'Statement')
  async getStatementById(
    userId: string,
    statementId: string,
  ): Promise<TResponse<StatementResponseDto>> {
    const statement = await this.prisma.statement.findUnique({
      where: { statementId, userId },
    });

    if (!statement) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    return successResponse(
      statement as any,
      'Statement fetched successfully',
    );
  }

  @HandleError('Failed to get statement details', 'Statement')
  async getStatementDetails(
    userId: string,
    statementId: string,
  ): Promise<TResponse<StatementDetailsDto>> {
    const statement = await this.prisma.statement.findUnique({
      where: { statementId, userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
        dealStatuses: {
          orderBy: { account: 'asc' },
        },
      },
    });

    if (!statement) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    // Get related data
    const [releases, tracks, assets, platforms, territories] =
      await this.prisma.$transaction([
        this.prisma.statementRelease.findMany({
          where: { statementId },
          orderBy: { amount: 'desc' },
        }),
        this.prisma.statementRelease.findMany({
          where: { statementId, isrc: { not: null } },
          orderBy: { amount: 'desc' },
        }),
        this.prisma.statementRelease.findMany({
          where: { statementId, assetId: { not: null } },
          orderBy: { amount: 'desc' },
        }),
        this.prisma.statementPlatform.findMany({
          where: { statementId },
          orderBy: { amount: 'desc' },
        }),
        this.prisma.statementTerritory.findMany({
          where: { statementId },
          orderBy: { amount: 'desc' },
        }),
      ]);

    const details: StatementDetailsDto = {
      statement,
      releases,
      tracks,
      assets,
      platforms,
      territories,
      dealStatuses: statement.dealStatuses,
    };

    return successResponse(details, 'Statement details fetched successfully');
  }

  @HandleError('Failed to update statement', 'Statement')
  async updateStatement(
    userId: string,
    statementId: string,
    dto: UpdateStatementDto,
  ): Promise<TResponse<StatementResponseDto>> {
    const existing = await this.prisma.statement.findUnique({
      where: { statementId, userId },
    });

    if (!existing) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    const statement = await this.prisma.statement.update({
      where: { statementId, userId },
      data: {
        ...(dto.paidOn && { paidOn: new Date(dto.paidOn) }),
        ...(dto.totalEarnings !== undefined && {
          totalEarnings: dto.totalEarnings,
        }),
        ...(dto.totalExpenses !== undefined && {
          totalExpenses: dto.totalExpenses,
        }),
        ...(dto.payment !== undefined && { payment: dto.payment }),
        ...(dto.status && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    this.logger.log(`Statement updated: ${statementId} by user ${userId}`);

    return successResponse(
      statement as any,
      'Statement updated successfully',
    );
  }

  @HandleError('Failed to delete statement', 'Statement')
  async deleteStatement(
    userId: string,
    statementId: string,
  ): Promise<TResponse<any>> {
    const statement = await this.prisma.statement.findUnique({
      where: { statementId, userId },
    });

    if (!statement) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Statement not found');
    }

    await this.prisma.statement.delete({
      where: { statementId, userId },
    });

    this.logger.log(`Statement deleted: ${statementId} by user ${userId}`);

    return successResponse({ statementId }, 'Statement deleted successfully');
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  }
}
