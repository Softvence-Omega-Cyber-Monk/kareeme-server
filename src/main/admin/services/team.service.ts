import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HandleError } from '@/core/error/handle-error.decorator';
import { AppError } from '@/core/error/handle-error.app';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  TeamMemberResponseDto,
} from '../dto/team.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to add team member', 'Team')
  async addTeamMember(
    dto: CreateTeamMemberDto,
  ): Promise<TResponse<TeamMemberResponseDto>> {
    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // If user doesn't exist, create one
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: dto.role === 'Admin' ? 'ADMIN' : 'DISTRIBUTOR',
        },
      });
    }

    // Create team member
    const teamMember = await this.prisma.teamMember.create({
      data: {
        userId: user.id,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        status: 'Active',
      },
    });

    this.logger.log(`Team member added: ${teamMember.email}`);

    return successResponse(
      teamMember as any,
      'Team member added successfully',
    );
  }

  @HandleError('Failed to get team members', 'Team')
  async getTeamMembers(
    pg: PaginationDto,
  ): Promise<TPaginatedResponse<TeamMemberResponseDto>> {
    const page = pg.page && +pg.page > 0 ? +pg.page : 1;
    const limit = pg.limit && +pg.limit > 0 ? +pg.limit : 20;
    const skip = (page - 1) * limit;

    const [members, total] = await this.prisma.$transaction([
      this.prisma.teamMember.findMany({
        skip,
        take: limit,
        orderBy: { joinDate: 'desc' },
      }),
      this.prisma.teamMember.count(),
    ]);

    return successPaginatedResponse(
      members as any,
      { page, limit, total },
      'Team members fetched successfully',
    );
  }

  @HandleError('Failed to update team member', 'Team')
  async updateTeamMember(
    memberId: string,
    dto: UpdateTeamMemberDto,
  ): Promise<TResponse<TeamMemberResponseDto>> {
    const member = await this.prisma.teamMember.findUnique({
      where: { memberId },
    });

    if (!member) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Team member not found');
    }

    const updated = await this.prisma.teamMember.update({
      where: { memberId },
      data: {
        ...(dto.role && { role: dto.role }),
        ...(dto.status && { status: dto.status }),
      },
    });

    this.logger.log(`Team member updated: ${memberId}`);

    return successResponse(
      updated as any,
      'Team member updated successfully',
    );
  }

  @HandleError('Failed to suspend team member', 'Team')
  async suspendTeamMember(memberId: string): Promise<TResponse<any>> {
    const member = await this.prisma.teamMember.findUnique({
      where: { memberId },
    });

    if (!member) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Team member not found');
    }

    const updated = await this.prisma.teamMember.update({
      where: { memberId },
      data: { status: 'Suspended' },
    });

    this.logger.log(`Team member suspended: ${memberId}`);

    return successResponse(updated, 'Team member suspended successfully');
  }

  @HandleError('Failed to delete team member', 'Team')
  async deleteTeamMember(memberId: string): Promise<TResponse<any>> {
    const member = await this.prisma.teamMember.findUnique({
      where: { memberId },
    });

    if (!member) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Team member not found');
    }

    await this.prisma.teamMember.delete({
      where: { memberId },
    });

    this.logger.log(`Team member deleted: ${memberId}`);

    return successResponse({ memberId }, 'Team member deleted successfully');
  }

  @HandleError('Failed to send invitation', 'Team')
  async sendInvitation(email: string): Promise<TResponse<any>> {
    // Here you would send an email invitation
    // For now, just return success
    this.logger.log(`Invitation sent to: ${email}`);

    return successResponse(
      { email, sent: true },
      'Invitation sent successfully',
    );
  }
}
