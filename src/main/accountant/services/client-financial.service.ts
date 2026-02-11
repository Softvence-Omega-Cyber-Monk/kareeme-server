import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { ClientManagementDto } from '../dto/accountant.dto';

@Injectable()
export class ClientFinancialService {
  private readonly logger = new Logger(ClientFinancialService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get clients', 'ClientFinancial')
  async getClients(
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ClientManagementDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    // Use Statement model as a source for client financials (generated model)
    const [clients, total] = await this.prisma.$transaction([
      this.prisma.statement.findMany({
        skip,
        take: limit,
        orderBy: { totalEarnings: 'desc' },
        include: { user: true },
      }),
      this.prisma.statement.count(),
    ]);

    const clientData = clients.map((client : any) => ({
      clientFinId: client.statementId,
      clientName: client.user?.name || 'Unknown',
      email: client.user?.email || '',
      totalEarning: `$${Number(client.totalEarnings || 0).toFixed(2)}`,
      pendingPayment: `$${Number(client.payment || 0).toFixed(2)}`,
      lastPaymentDate: client.paidOn || new Date(),
    }));

    return successPaginatedResponse(
      clientData,
      { page, limit, total },
      'Clients fetched successfully',
    );
  }
}
