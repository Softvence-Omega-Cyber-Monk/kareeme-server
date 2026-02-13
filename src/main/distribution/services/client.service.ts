import {
    successPaginatedResponse,
    successResponse,
    TPaginatedResponse,
    TResponse,
} from '@/common/utils/response.util';
import { HandleError } from '@/core/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to create client', 'Client')
  async createClient(distributorId: string, dto: any): Promise<TResponse<any>> {
    // Create a user with role CLIENT
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phoneNumber,
        role: 'CLIENT', // Set role as CLIENT
        status: 'ACTIVE',
        isVerified: false,
        isTFAEnabled: false,
      },
    });

    return successResponse(
      {
        clientId: user.id,
        userId: user.id,
        distributorId,
        user,
        role: dto.role,
        phoneNumber: dto.phoneNumber,
        totalReleases: 0,
        isActive: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      'Client created successfully',
    );
  }

  @HandleError('Failed to get clients', 'Client')
  async getClients(
    distributorId: string,
    pg: any,
  ): Promise<TPaginatedResponse<any>> {
    const page = pg?.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg?.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    // Get users with role CLIENT
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: {
          role: 'CLIENT',
          status: { not: 'DELETED' },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { releases: true },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'CLIENT',
          status: { not: 'DELETED' },
        },
      }),
    ]);

    const items = users.map((user) => ({
      clientId: user.id,
      userId: user.id,
      distributorId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      role: 'Artist', // Default role
      phoneNumber: user.phone,
      totalReleases: user._count.releases,
      isActive: user.status === 'ACTIVE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return successPaginatedResponse(
      items,
      { page, limit, total },
      'Clients fetched successfully',
    );
  }

  @HandleError('Failed to deactivate client', 'Client')
  async deactivateClient(
    distributorId: string,
    clientId: string,
  ): Promise<TResponse<any>> {
    // Update user status to Inactive
    const user = await this.prisma.user.update({
      where: { id: clientId },
      data: { status: 'INACTIVE' },
    });

    return successResponse(user, 'Client deactivated successfully');
  }
}