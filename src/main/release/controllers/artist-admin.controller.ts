import { UserEnum } from '@/common/enum/user.enum';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArtistResponseDto, UpdateArtistDto } from '../dto/artist.dto';
import { ArtistService } from '../services/artist.service';

@ApiTags('Artists - Admin/Distributor')
@ApiBearerAuth()
@Controller('admin/artists')
@ValidateAuth(UserEnum.ADMIN, UserEnum.DISTRIBUTOR, UserEnum.SUPER_ADMIN)
export class ArtistAdminController {
  constructor(private readonly artistService: ArtistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all artists (admin/distributor only)',
    description:
      'Retrieve all artists without user-scoping. Accessible by admin and distributor roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Artists fetched successfully',
    type: [ArtistResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getAllArtists(@Query() pg: PaginationDto) {
    return this.artistService.getAllArtistsForAdmin(pg);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get artist by ID (admin/distributor only)',
    description:
      'Retrieve detailed information about any artist by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Artist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist fetched successfully',
    type: ArtistResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getArtistById(@Param('id') id: string) {
    return this.artistService.getArtistByIdForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update artist by ID (admin/distributor only)',
    description:
      'Update any artist by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Artist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist updated successfully',
    type: ArtistResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Artist not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async updateArtist(@Param('id') id: string, @Body() dto: UpdateArtistDto) {
    return this.artistService.updateArtistForAdmin(id, dto);
  }
}
