import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BackCatalogueResponseDto,
  CreateBackCatalogueDto,
} from '../dto/back-catalogue.dto';
import { BackCatalogueService } from '../services/back-catalogue.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Distribution - Back Catalogue')
@Controller('distribution/back-catalogue')
export class BackCatalogueController {
  constructor(private readonly backCatalogueService: BackCatalogueService) {}

  @Post()
  @ApiOperation({
    summary: 'Create back catalogue',
    description: 'Add client back catalogue entry',
  })
  @ApiResponse({ status: 201, type: BackCatalogueResponseDto })
  async createBackCatalogue(
    @GetUser('sub') distributorId: string,
    @Body() dto: CreateBackCatalogueDto,
  ) {
    return this.backCatalogueService.createBackCatalogue(distributorId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get back catalogues',
    description: 'Get paginated list of client back catalogues',
  })
  @ApiResponse({ status: 200, type: [BackCatalogueResponseDto] })
  async getBackCatalogues(
    @GetUser('sub') distributorId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.backCatalogueService.getBackCatalogues(distributorId, pg);
  }

  @Get(':catalogueId')
  @ApiOperation({
    summary: 'Get back catalogue details',
    description: 'Get single back catalogue with details',
  })
  @ApiParam({ name: 'catalogueId' })
  @ApiResponse({ status: 200, type: BackCatalogueResponseDto })
  async getBackCatalogueById(
    @GetUser('sub') distributorId: string,
    @Param('catalogueId') catalogueId: string,
  ) {
    return this.backCatalogueService.getBackCatalogueById(
      distributorId,
      catalogueId,
    );
  }
}
