import { UserEnum } from '@/common/enum/user.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ReleaseListItemDto,
  ReleaseResponseDto,
} from '../dto/release-response.dto';
import { UpdateReleaseDto } from '../dto/update-release.dto';
import { ReleaseService } from '../services/release.service';

@ApiTags('Releases - Admin/Distributor')
@ApiBearerAuth()
@Controller('admin/releases')
@ValidateAuth(UserEnum.ADMIN, UserEnum.DISTRIBUTOR, UserEnum.SUPER_ADMIN)
export class ReleaseAdminController {
  constructor(private readonly releaseService: ReleaseService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all releases (admin/distributor only)',
    description:
      'Retrieve all releases without user-scoping. Accessible by admin and distributor roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Releases fetched successfully',
    type: [ReleaseListItemDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getAllReleases(@Query() pg: PaginationDto) {
    return this.releaseService.getAllReleasesForAdmin(pg);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get release by ID (admin/distributor only)',
    description:
      'Retrieve detailed information about any release by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release fetched successfully',
    type: ReleaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getReleaseById(@Param('id') id: string) {
    return this.releaseService.getReleaseByIdForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update release by ID (admin/distributor only)',
    description:
      'Update any release by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Release updated successfully',
    type: ReleaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Release not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async updateRelease(
    @Param('id') id: string,
    @Body() dto: UpdateReleaseDto,
  ) {
    return this.releaseService.updateReleaseForAdmin(id, dto);
  }
}
