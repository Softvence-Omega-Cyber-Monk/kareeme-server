import { UserEnum } from '@/common/enum/user.enum';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TrackResponseDto } from '../dto/release-response.dto';
import { UpdateTrackDto } from '../dto/track.dto';
import { TrackService } from '../services/track.service';

@ApiTags('Tracks - Admin/Distributor')
@ApiBearerAuth()
@Controller('admin/tracks')
@ValidateAuth(UserEnum.ADMIN, UserEnum.DISTRIBUTOR, UserEnum.SUPER_ADMIN)
export class TrackAdminController {
  constructor(private readonly trackService: TrackService) {}

  @Get('release/:releaseId')
  @ApiOperation({
    summary: 'Get tracks by release ID (admin/distributor only)',
    description:
      'Retrieve all tracks for a specific release. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracks fetched successfully',
    type: [TrackResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getTracksByRelease(@Param('releaseId') releaseId: string) {
    return this.trackService.getTracksByReleaseForAdmin(releaseId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tracks (admin/distributor only)',
    description:
      'Retrieve all tracks. Use release/:releaseId to filter by release. Accessible by admin and distributor roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracks fetched successfully',
    type: [TrackResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getAllTracks() {
    return this.trackService.getAllTracksForAdmin();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get track by ID (admin/distributor only)',
    description:
      'Retrieve detailed information about any track by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Track fetched successfully',
    type: TrackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Track not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getTrackById(@Param('id') id: string) {
    return this.trackService.getTrackByIdForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update track by ID (admin/distributor only)',
    description:
      'Update any track by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Track updated successfully',
    type: TrackResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Track not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async updateTrack(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.trackService.updateTrackForAdmin(id, dto);
  }
}
