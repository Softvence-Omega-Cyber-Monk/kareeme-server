import {
    successPaginatedResponse,
    successResponse,
} from '@/common/utils/response.util';
import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post,
    Query,
    Res,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CreateReleaseFormDto } from './dto/create-release-form.dto';
import {
    ExportReleasesQueryDto,
    GetReleasesQueryDto,
    GetSplitSheetsQueryDto,
} from './dto/query-release.dto';
import { ReleasesService } from './releases.service';

@ApiTags('Releases')
@ApiBearerAuth()
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Post()
  @ValidateAuth()
  @ApiOperation({
    summary: 'Create a new release',
    description:
      'Create a complete release with all related data (artists, tracks, territories, split sheets, etc.) in a single submission. Split sheets are auto-generated from tracks if not provided.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Release created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async createRelease(
    @Body() dto: CreateReleaseFormDto,
    @GetUser('sub') userId: string,
  ) {
    // Override userId with authenticated user
    dto.userId = userId;
    const release = await this.releasesService.createRelease(dto);
    return successResponse(release, 'Release created successfully');
  }

  @Get()
  @ValidateAuth()
  @ApiOperation({
    summary: 'Get all releases',
    description:
      'Get all releases with filtering, sorting, and searching capabilities',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'releaseDate', 'releaseTitle', 'status'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'genre', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'typeOfRelease', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Releases retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getAllReleases(@Query() query: GetReleasesQueryDto) {
    const result = await this.releasesService.getAllReleases(query);
    return successPaginatedResponse(
      result.data,
      result.metadata,
      'Releases retrieved successfully',
    );
  }

  @Get('export')
  @ValidateAuth()
  @ApiOperation({
    summary: 'Export releases',
    description:
      'Export releases to CSV or Excel format with the same filtering options as the list endpoint',
  })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'excel'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'genre', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'typeOfRelease', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Export file generated successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async exportReleases(
    @Query() query: ExportReleasesQueryDto,
    @Res() res: Response,
  ) {
    const exportData = await this.releasesService.exportReleases(query);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportData.filename}"`,
    );
    res.setHeader('Content-Type', exportData.contentType);

    return res.send(exportData.content);
  }

  @Get('split-sheets')
  @ValidateAuth()
  @ApiOperation({
    summary: 'Get all split sheets',
    description:
      'Get all split sheet agreements with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'releaseId', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Split sheets retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getAllSplitSheets(@Query() query: GetSplitSheetsQueryDto) {
    const result = await this.releasesService.getAllSplitSheets(query);
    return successPaginatedResponse(
      result.data,
      result.metadata,
      'Split sheets retrieved successfully',
    );
  }

  @Get('split-sheets/:id')
  @ValidateAuth()
  @ApiOperation({
    summary: 'Get split sheet by ID',
    description:
      'Get detailed information about a specific split sheet agreement including all contributors',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Split sheet retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Split sheet not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getSplitSheetById(@Param('id') id: string) {
    const splitSheet = await this.releasesService.getSplitSheetById(id);
    return successResponse(splitSheet, 'Split sheet retrieved successfully');
  }

  @Get(':id')
  @ValidateAuth()
  @ApiOperation({
    summary: 'Get release by ID',
    description:
      'Get detailed information about a specific release including all related data',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Release retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Release not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getReleaseById(@Param('id') id: string) {
    const release = await this.releasesService.getReleaseById(id);
    return successResponse(release, 'Release retrieved successfully');
  }
}