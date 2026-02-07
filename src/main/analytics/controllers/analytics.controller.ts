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
import { AssetResponseDto, CreateAssetDto } from '../dto/asset.dto';
import {
  ClaimResponseDto,
  CreateClaimDto,
  CreateGeoTrendDto,
  GeoTrendResponseDto,
  UpdateClaimDto,
} from '../dto/geo-claim.dto';
import {
  CreatePlatformAnalyticsDto,
  Platform,
  PlatformOverviewDto,
} from '../dto/platform.dto';
import { PlatformAnalyticsService } from '../services/platform.service';
import {
  AssetService,
  ClaimService,
  GeoTrendService,
} from '../services/analytics-details.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Analytics - Platform')
@Controller('analytics')
export class PlatformController {
  constructor(
    private readonly platformService: PlatformAnalyticsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get all platforms dashboard',
    description: 'Get overview data for all streaming platforms',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data fetched successfully',
    type: [PlatformOverviewDto],
  })
  async getDashboard(@GetUser('sub') userId: string) {
    return this.platformService.getDashboard(userId);
  }

  @Get(':platform/overview')
  @ApiOperation({
    summary: 'Get single platform overview',
    description:
      'Get detailed overview for a specific platform including charts, top countries, assets, and claims',
  })
  @ApiParam({
    name: 'platform',
    enum: Platform,
    example: Platform.YouTube,
  })
  @ApiResponse({
    status: 200,
    description: 'Platform overview fetched successfully',
    type: PlatformOverviewDto,
  })
  async getPlatformOverview(
    @GetUser('sub') userId: string,
    @Param('platform') platform: Platform,
  ) {
    return this.platformService.getPlatformOverview(userId, platform);
  }

  @Post('platform')
  @ApiOperation({
    summary: 'Create/update platform analytics',
    description: 'Add or update daily analytics data for a platform',
  })
  @ApiResponse({
    status: 201,
    description: 'Platform analytics created/updated successfully',
  })
  async createPlatformAnalytics(
    @GetUser('sub') userId: string,
    @Body() dto: CreatePlatformAnalyticsDto,
  ) {
    return this.platformService.createPlatformAnalytics(userId, dto);
  }
}

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Analytics - Assets')
@Controller('analytics/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @ApiOperation({
    summary: 'Create asset',
    description: 'Add a new asset (video/track) to analytics',
  })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully',
    type: AssetResponseDto,
  })
  async createAsset(
    @GetUser('sub') userId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetService.createAsset(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get assets',
    description: 'Get paginated list of assets, optionally filtered by platform',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    enum: Platform,
    example: Platform.YouTube,
  })
  @ApiResponse({
    status: 200,
    description: 'Assets fetched successfully',
    type: [AssetResponseDto],
  })
  async getAssets(
    @GetUser('sub') userId: string,
    @Query('platform') platform: Platform | null,
    @Query() pg: PaginationDto,
  ) {
    return this.assetService.getAssets(userId, platform, pg);
  }

  @Delete(':assetId')
  @ApiOperation({
    summary: 'Delete asset',
    description: 'Remove an asset from analytics',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset deleted successfully',
  })
  async deleteAsset(
    @GetUser('sub') userId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetService.deleteAsset(userId, assetId);
  }
}

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Analytics - Geo Trends')
@Controller('analytics/geo-trends')
export class GeoTrendController {
  constructor(private readonly geoTrendService: GeoTrendService) {}

  @Post()
  @ApiOperation({
    summary: 'Create geo trend',
    description: 'Add geographic performance data',
  })
  @ApiResponse({
    status: 201,
    description: 'Geo trend created successfully',
    type: GeoTrendResponseDto,
  })
  async createGeoTrend(
    @GetUser('sub') userId: string,
    @Body() dto: CreateGeoTrendDto,
  ) {
    return this.geoTrendService.createGeoTrend(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get geo trends',
    description:
      'Get paginated list of geographic trends, optionally filtered by platform',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    enum: Platform,
    example: Platform.YouTube,
  })
  @ApiResponse({
    status: 200,
    description: 'Geo trends fetched successfully',
    type: [GeoTrendResponseDto],
  })
  async getGeoTrends(
    @GetUser('sub') userId: string,
    @Query('platform') platform: Platform | null,
    @Query() pg: PaginationDto,
  ) {
    return this.geoTrendService.getGeoTrends(userId, platform, pg);
  }
}

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Analytics - Claims')
@Controller('analytics/claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Post()
  @ApiOperation({
    summary: 'Create claim',
    description: 'Add a content claim to track',
  })
  @ApiResponse({
    status: 201,
    description: 'Claim created successfully',
    type: ClaimResponseDto,
  })
  async createClaim(
    @GetUser('sub') userId: string,
    @Body() dto: CreateClaimDto,
  ) {
    return this.claimService.createClaim(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get claims',
    description:
      'Get paginated list of claims, optionally filtered by platform',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    enum: Platform,
    example: Platform.YouTube,
  })
  @ApiResponse({
    status: 200,
    description: 'Claims fetched successfully',
    type: [ClaimResponseDto],
  })
  async getClaims(
    @GetUser('sub') userId: string,
    @Query('platform') platform: Platform | null,
    @Query() pg: PaginationDto,
  ) {
    return this.claimService.getClaims(userId, platform, pg);
  }

  @Patch(':claimId')
  @ApiOperation({
    summary: 'Update claim',
    description: 'Update claim status or details',
  })
  @ApiParam({
    name: 'claimId',
    description: 'Claim ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim updated successfully',
    type: ClaimResponseDto,
  })
  async updateClaim(
    @GetUser('sub') userId: string,
    @Param('claimId') claimId: string,
    @Body() dto: UpdateClaimDto,
  ) {
    return this.claimService.updateClaim(userId, claimId, dto);
  }

  @Delete(':claimId')
  @ApiOperation({
    summary: 'Delete claim',
    description: 'Remove a claim from tracking',
  })
  @ApiParam({
    name: 'claimId',
    description: 'Claim ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Claim deleted successfully',
  })
  async deleteClaim(
    @GetUser('sub') userId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.claimService.deleteClaim(userId, claimId);
  }
}
