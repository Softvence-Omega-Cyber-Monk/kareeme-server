import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApproveSubmissionDto,
  DeclineSubmissionDto,
  SubmissionResponseDto,
  SubmissionStatus,
} from '../dto/submission.dto';
import { SubmissionService } from '../services/submission.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Distribution - Submissions')
@Controller('distribution/submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all releases as submissions',
    description: 'Get all releases. Filter by status to see pending (not yet approved), approved, or declined releases.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SubmissionStatus,
    description: 'PendingReview = releases not yet approved, Approved = releases with distribution, Declined = declined releases',
  })
  @ApiResponse({ status: 200, type: [SubmissionResponseDto] })
  async getSubmissions(
    @GetUser('sub') distributorId: string,
    @Query('status') status: SubmissionStatus | null,
    @Query() pg: PaginationDto,
  ) {
    return this.submissionService.getSubmissions(distributorId, status, pg);
  }

  @Get(':releaseId')
  @ApiOperation({
    summary: 'Get release details',
    description: 'Get single release with full details including tracks and split sheets',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID (same as submission ID)' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  async getSubmissionById(
    @GetUser('sub') distributorId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.submissionService.getSubmissionById(distributorId, releaseId);
  }

  @Patch(':releaseId/approve')
  @ApiOperation({
    summary: 'Approve release for distribution',
    description: 'Approve a release and create distribution record. The release will now appear in the distributions list.',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to approve' })
  @ApiResponse({ status: 200, description: 'Release approved and distribution created' })
  async approveSubmission(
    @GetUser('sub') distributorId: string,
    @Param('releaseId') releaseId: string,
    @Body() dto: ApproveSubmissionDto,
  ) {
    return this.submissionService.approveSubmission(
      distributorId,
      releaseId,
      dto,
    );
  }

  @Patch(':releaseId/decline')
  @ApiOperation({
    summary: 'Decline release',
    description: 'Decline a release with a reason. Creates a declined distribution record.',
  })
  @ApiParam({ name: 'releaseId', description: 'Release ID to decline' })
  @ApiResponse({ status: 200, description: 'Release declined' })
  async declineSubmission(
    @GetUser('sub') distributorId: string,
    @Param('releaseId') releaseId: string,
    @Body() dto: DeclineSubmissionDto,
  ) {
    return this.submissionService.declineSubmission(
      distributorId,
      releaseId,
      dto,
    );
  }
}
