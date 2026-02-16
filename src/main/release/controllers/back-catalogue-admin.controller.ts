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
import {
  BackCatalogueResponseDto,
  UpdateBackCatalogueDto,
} from '../dto/back-catalogue.dto';
import { BackCatalogueService } from '../services/back-catalogue.service';

@ApiTags('Back Catalogue - Admin/Distributor')
@ApiBearerAuth()
@Controller('admin/back-catalogue')
@ValidateAuth(UserEnum.ADMIN, UserEnum.DISTRIBUTOR, UserEnum.SUPER_ADMIN)
export class BackCatalogueAdminController {
  constructor(private readonly backCatalogueService: BackCatalogueService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all back catalogue entries (admin/distributor only)',
    description:
      'Retrieve all back catalogue entries without user-scoping. Accessible by admin and distributor roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entries fetched successfully',
    type: [BackCatalogueResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getAllBackCatalogues(@Query() pg: PaginationDto) {
    return this.backCatalogueService.getAllBackCataloguesForAdmin(pg);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get back catalogue entry by ID (admin/distributor only)',
    description:
      'Retrieve detailed information about any back catalogue entry by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Back Catalogue ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entry fetched successfully',
    type: BackCatalogueResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Back catalogue entry not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getBackCatalogueById(@Param('id') id: string) {
    return this.backCatalogueService.getBackCatalogueByIdForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update back catalogue entry by ID (admin/distributor only)',
    description:
      'Update any back catalogue entry by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Back Catalogue ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entry updated successfully',
    type: BackCatalogueResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Back catalogue entry not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async updateBackCatalogue(
    @Param('id') id: string,
    @Body() dto: UpdateBackCatalogueDto,
  ) {
    return this.backCatalogueService.updateBackCatalogueForAdmin(id, dto);
  }
}
