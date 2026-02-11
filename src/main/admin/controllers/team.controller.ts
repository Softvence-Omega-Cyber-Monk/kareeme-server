import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { TeamService } from '../services/team.service';
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
  TeamMemberResponseDto,
} from '../dto/team.dto';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Admin - Team Management')
@Controller('admin/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({
    summary: 'Add new team member',
    description: 'Create a new team member with specified role',
  })
  @ApiResponse({ status: 201, type: TeamMemberResponseDto })
  async addTeamMember(@Body() dto: CreateTeamMemberDto) {
    return this.teamService.addTeamMember(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all team members',
    description: 'Get paginated list of all team members',
  })
  @ApiResponse({ status: 200, type: [TeamMemberResponseDto] })
  async getTeamMembers(@Query() pg: PaginationDto) {
    return this.teamService.getTeamMembers(pg);
  }

  @Patch(':memberId')
  @ApiOperation({
    summary: 'Update team member',
    description: 'Update team member role or status',
  })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({ status: 200, type: TeamMemberResponseDto })
  async updateTeamMember(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamService.updateTeamMember(memberId, dto);
  }

  @Patch(':memberId/suspend')
  @ApiOperation({
    summary: 'Suspend team member',
    description: 'Suspend a team member account',
  })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({ status: 200 })
  async suspendTeamMember(@Param('memberId') memberId: string) {
    return this.teamService.suspendTeamMember(memberId);
  }

  @Delete(':memberId')
  @ApiOperation({
    summary: 'Delete team member',
    description: 'Remove a team member from the system',
  })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({ status: 200 })
  async deleteTeamMember(@Param('memberId') memberId: string) {
    return this.teamService.deleteTeamMember(memberId);
  }

  @Post('invite')
  @ApiOperation({
    summary: 'Send team invitation',
    description: 'Send an invitation email to join the team',
  })
  @ApiResponse({ status: 200 })
  async sendInvitation(@Body() body: { email: string }) {
    return this.teamService.sendInvitation(body.email);
  }
}
