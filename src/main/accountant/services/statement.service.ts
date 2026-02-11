import { successResponse, TResponse } from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { YearStatementDto } from '../dto/accountant.dto';

@Injectable()
export class StatementService {
  private readonly logger = new Logger(StatementService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get statements', 'Statement')
  async getStatements(userId: string): Promise<TResponse<YearStatementDto[]>> {
    const years = [2025, 2024, 2023, 2022];
    const yearStatements: YearStatementDto[] = [];

    for (const year of years) {
      // Use Statement model (generated) - statementYear maps to year
      const statements = await this.prisma.statement.findMany({
        where: { userId, statementYear: year },
        orderBy: { statementMonth: 'desc' },
      });

      const totalAmount = statements.reduce((sum: number, s: any) => sum + Number(s.totalEarnings || 0), 0);

      yearStatements.push({
        year,
        totalAmount: `$${totalAmount.toFixed(2)} USD`,
        statements: statements.map((s: any) => ({
          statementId: s.statementId,
          title: s.title,
          subtitle: s.subtitle || '',
          amount: `$${Number(s.totalEarnings || 0).toFixed(2)} USD`,
          status: s.status,
          month: s.statementMonth,
          year: s.statementYear,
          fileUrl: s.fileUrl,
        })),
      });
    }

    return successResponse(yearStatements, 'Statements fetched successfully');
  }
}
