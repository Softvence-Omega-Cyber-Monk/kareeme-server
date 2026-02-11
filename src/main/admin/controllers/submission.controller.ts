import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { AdminSubmissionService } from '../services/submission.service';
import { SubmissionCardDto, SubmissionDetailsDto } from '../dto/submission.dto';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Admin - Submissions')
@Controller('admin/submissions')
export class AdminSubmissionController {
  constructor(
    private readonly adminSubmissionService: AdminSubmissionService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all submissions',
    description:
      'Get all releases as submissions. Filter by status (In Review, Approved, Declined), release type, and search',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status: In Review, Approved, Declined',
  })
  @ApiQuery({
    name: 'releaseType',
    required: false,
    description: 'Filter by release type: Single, Album, EP',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or artist',
  })
  @ApiResponse({ status: 200, type: [SubmissionCardDto] })
  async getSubmissions(
    @Query('status') status: string | null,
    @Query('releaseType') releaseType: string | null,
    @Query('search') search: string | null,
    @Query() pg: PaginationDto,
  ) {
    return this.adminSubmissionService.getSubmissions(
      status,
      releaseType,
      search,
      pg,
    );
  }

  @Get(':releaseId')
  @ApiOperation({
    summary: 'Get submission details',
    description:
      'Get complete submission details including tracks, artists, and metadata',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID' })
  @ApiResponse({ status: 200, type: SubmissionDetailsDto })
  async getSubmissionDetails(@Param('releaseId') releaseId: string) {
    return this.adminSubmissionService.getSubmissionDetails(releaseId);
  }

  @Patch(':releaseId/approve')
  @ApiOperation({
    summary: 'Approve submission',
    description:
      'Approve a release submission and create distribution record',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to approve' })
  @ApiResponse({ status: 200 })
  async approveSubmission(@Param('releaseId') releaseId: string) {
    return this.adminSubmissionService.approveSubmission(releaseId);
  }

  @Patch(':releaseId/decline')
  @ApiOperation({
    summary: 'Decline submission',
    description: 'Decline a release submission with reason',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to decline' })
  @ApiResponse({ status: 200 })
  async declineSubmission(
    @Param('releaseId') releaseId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminSubmissionService.declineSubmission(
      releaseId,
      body.reason,
    );
  }

  @Post(':releaseId/export')
  @ApiOperation({
    summary: 'Export submission data',
    description: 'Export complete submission data for download',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to export' })
  @ApiResponse({ status: 200 })
  async exportSubmissionData(@Param('releaseId') releaseId: string) {
    return this.adminSubmissionService.exportSubmissionData(releaseId);
  }
}
