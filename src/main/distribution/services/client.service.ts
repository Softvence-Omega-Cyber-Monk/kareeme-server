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
import { ClientResponseDto, CreateClientDto } from '../dto/client.dto';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create client', 'Client')
  async createClient(
    distributorId: string,
    dto: CreateClientDto,
  ): Promise<TResponse<ClientResponseDto>> {
    // Check if user exists, if not create
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: 'CLIENT',
        },
      });
    }

    // Generate OTP
    const oneTimePassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const client = await this.prisma.distributorClient.create({
      data: {
        distributorId,
        userId: user.id,
        role: dto.role,
        phoneNumber: dto.phoneNumber,
        oneTimePassword,
        otpExpiresAt,
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Client created: ${client.clientId} - ${user.email}`);

    return successResponse(client as any, 'Client created successfully');
  }

  @HandleError('Failed to get clients', 'Client')
  async getClients(
    distributorId: string,
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<ClientResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DistributorClientWhereInput = {
      distributorId,
      isActive: true,
    };

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.distributorClient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      this.prisma.distributorClient.count({ where }),
    ]);

    return successPaginatedResponse(
      clients as any,
      { page, limit, total },
      'Clients fetched successfully',
    );
  }

  @HandleError('Failed to deactivate client', 'Client')
  async deactivateClient(
    distributorId: string,
    clientId: string,
  ): Promise<TResponse<any>> {
    const client = await this.prisma.distributorClient.findUnique({
      where: { clientId, distributorId },
    });

    if (!client) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Client not found');
    }

    const updated = await this.prisma.distributorClient.update({
      where: { clientId },
      data: { isActive: false },
    });

    this.logger.log(`Client deactivated: ${clientId}`);

    return successResponse(updated, 'Client deactivated successfully');
  }
}
