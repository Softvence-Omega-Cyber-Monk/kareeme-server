import { PaginationDto } from '@/common/dto/pagination.dto';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Logger, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { DistributionSubmissionService } from '../services/distribution-submission.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Distribution - Submissions')
@Controller('distribution/submissions')
export class DistributionSubmissionController {
  private readonly logger = new Logger(DistributionSubmissionController.name);

  constructor(private readonly submissionService: DistributionSubmissionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all submissions (releases)',
    description:
      'Get all releases as submissions. Submissions ARE releases filtered by status.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status: PendingReview, Approved, Declined',
  })
  async getSubmissions(
    @Query('status') status: string | null,
    @Query() pg: PaginationDto,
  ) {
    return this.submissionService.getSubmissions(status, pg);
  }

  @Get(':releaseId')
  @ApiOperation({
    summary: 'Get submission details',
    description: 'Get complete release/submission details by releaseId',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID' })
  async getSubmissionById(@Param('releaseId') releaseId: string) {
    return this.submissionService.getSubmissionById(releaseId);
  }

  @Patch(':releaseId/approve')
  @ApiOperation({
    summary: 'Approve submission',
    description: 'Approve a release submission (sets Release.status = Approved). Body is optional.',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to approve' })
  async approveSubmission(
    @Param('releaseId') releaseId: string,
    @Body() body?: { note?: string }, // Make body optional with default
  ) {
    const note = body?.note; // Safe access
    this.logger.log(`approveSubmission endpoint hit for ${releaseId} note=${note}`);
    try {
      return await this.submissionService.approveSubmission(releaseId, note);
    } catch (err) {
      this.logger.error(`approveSubmission failed for ${releaseId}: ${(err as any)?.message || err}`, (err as any)?.stack);
      throw err;
    }
  }

  @Patch(':releaseId/decline')
  @ApiOperation({
    summary: 'Decline submission',
    description: 'Decline a release submission with reason (sets Release.status = Declined)',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to decline' })
  async declineSubmission(
    @Param('releaseId') releaseId: string,
    @Body() body: { reason: string },
  ) {
    return this.submissionService.declineSubmission(releaseId, body.reason);
  }
}