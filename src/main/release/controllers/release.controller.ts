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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReleaseDto } from '../dto/create-release.dto';
import {
  ReleaseListItemDto,
  ReleaseResponseDto,
} from '../dto/release-response.dto';
import { UpdateReleaseDto } from '../dto/update-release.dto';
import { ReleaseService } from '../services/release.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Releases')
@Controller('releases')
export class ReleaseController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new release',
    description:
      'Create a new music release with basic information, artists, and territories',
  })
  @ApiResponse({
    status: 201,
    description: 'Release created successfully',
    type: ReleaseResponseDto,
  })
  async createRelease(
    @GetUser('sub') userId: string,
    @Body() dto: CreateReleaseDto,
  ) {
    return this.releaseService.createRelease(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all releases',
    description: 'Retrieve a paginated list of all releases for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Releases fetched successfully',
    type: [ReleaseListItemDto],
  })
  async getReleases(
    @GetUser('sub') userId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.releaseService.getReleases(userId, pg);
  }

  @Get(':releaseId')
  @ApiOperation({
    summary: 'Get a single release',
    description:
      'Retrieve detailed information about a specific release including tracks, artists, territories, and split sheets',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release fetched successfully',
    type: ReleaseResponseDto,
  })
  async getReleaseById(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.releaseService.getReleaseById(userId, releaseId);
  }

  @Patch(':releaseId')
  @ApiOperation({
    summary: 'Update a release',
    description: 'Update release information, artists, or territories',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release updated successfully',
    type: ReleaseResponseDto,
  })
  async updateRelease(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
    @Body() dto: UpdateReleaseDto,
  ) {
    return this.releaseService.updateRelease(userId, releaseId, dto);
  }

  @Delete(':releaseId')
  @ApiOperation({
    summary: 'Delete a release',
    description:
      'Delete a release and all associated data (tracks, split sheets, etc.)',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release deleted successfully',
  })
  async deleteRelease(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.releaseService.deleteRelease(userId, releaseId);
  }

  @Patch(':releaseId/status')
  @ApiOperation({
    summary: 'Update release status',
    description:
      'Update the status of a release (Draft, Submitted, Live, etc.)',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release status updated successfully',
    type: ReleaseResponseDto,
  })
  async updateReleaseStatus(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
    @Body('status') status: string,
  ) {
    return this.releaseService.updateReleaseStatus(userId, releaseId, status);
  }
}
