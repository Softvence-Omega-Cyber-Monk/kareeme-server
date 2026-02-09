import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddDistributionNoteDto,
  CreateDistributionDto,
  DashboardStatsDto,
  DistributionResponseDto,
  DistributionStatus,
  UpdateDistributionDto,
} from '../dto/distribution.dto';
import { DistributionService } from '../services/distribution.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Distribution Management')
@Controller('distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get distributor dashboard',
    description: 'Get dashboard stats, recent activity, and platform performance',
  })
  @ApiResponse({ status: 200, type: DashboardStatsDto })
  async getDashboard(@GetUser('sub') distributorId: string) {
    return this.distributionService.getDashboard(distributorId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create distribution',
    description: 'Create new distribution for a release',
  })
  @ApiResponse({ status: 201, type: DistributionResponseDto })
  async createDistribution(
    @GetUser('sub') distributorId: string,
    @Body() dto: CreateDistributionDto,
  ) {
    return this.distributionService.createDistribution(distributorId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get distributions',
    description: 'Get paginated list of distributions',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DistributionStatus,
  })
  @ApiResponse({ status: 200, type: [DistributionResponseDto] })
  async getDistributions(
    @GetUser('sub') distributorId: string,
    @Query('status') status: DistributionStatus | null,
    @Query() pg: PaginationDto,
  ) {
    return this.distributionService.getDistributions(distributorId, status, pg);
  }

  @Get(':distributionId')
  @ApiOperation({
    summary: 'Get distribution details',
    description: 'Get single distribution with full details',
  })
  @ApiParam({ name: 'distributionId' })
  @ApiResponse({ status: 200, type: DistributionResponseDto })
  async getDistributionById(
    @GetUser('sub') distributorId: string,
    @Param('distributionId') distributionId: string,
  ) {
    return this.distributionService.getDistributionById(
      distributorId,
      distributionId,
    );
  }

  @Patch(':distributionId')
  @ApiOperation({
    summary: 'Update distribution',
    description: 'Update distribution status',
  })
  @ApiParam({ name: 'distributionId' })
  @ApiResponse({ status: 200, type: DistributionResponseDto })
  async updateDistribution(
    @GetUser('sub') distributorId: string,
    @Param('distributionId') distributionId: string,
    @Body() dto: UpdateDistributionDto,
  ) {
    return this.distributionService.updateDistribution(
      distributorId,
      distributionId,
      dto,
    );
  }

  @Delete(':distributionId')
  @ApiOperation({
    summary: 'Delete distribution',
    description: 'Delete a distribution record',
  })
  @ApiParam({ name: 'distributionId' })
  @ApiResponse({ status: 200 })
  async deleteDistribution(
    @GetUser('sub') distributorId: string,
    @Param('distributionId') distributionId: string,
  ) {
    return this.distributionService.deleteDistribution(
      distributorId,
      distributionId,
    );
  }

  @Post(':distributionId/notes')
  @ApiOperation({
    summary: 'Add note to distribution',
    description: 'Add a comment/note to distribution',
  })
  @ApiParam({ name: 'distributionId' })
  @ApiResponse({ status: 201 })
  async addNote(
    @GetUser('sub') userId: string,
    @Param('distributionId') distributionId: string,
    @Body() dto: AddDistributionNoteDto,
  ) {
    return this.distributionService.addNote(
      userId,
      distributionId,
      userId,
      dto,
    );
  }
}
