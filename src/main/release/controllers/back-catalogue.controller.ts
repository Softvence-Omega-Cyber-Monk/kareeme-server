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
import {
  BackCatalogueResponseDto,
  CreateBackCatalogueDto,
  UpdateBackCatalogueDto,
} from '../dto/back-catalogue.dto';
import { BackCatalogueService } from '../services/back-catalogue.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Back Catalogue')
@Controller('back-catalogue')
export class BackCatalogueController {
  constructor(private readonly backCatalogueService: BackCatalogueService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a back catalogue entry',
    description:
      'Add a back catalogue entry for an existing release with distribution details, UPC, and catalogue information',
  })
  @ApiResponse({
    status: 201,
    description: 'Back catalogue entry created successfully',
    type: BackCatalogueResponseDto,
  })
  async createBackCatalogue(
    @GetUser('sub') userId: string,
    @Body() dto: CreateBackCatalogueDto,
  ) {
    return this.backCatalogueService.createBackCatalogue(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all back catalogue entries',
    description:
      'Retrieve a paginated list of all back catalogue entries for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entries fetched successfully',
    type: [BackCatalogueResponseDto],
  })
  async getBackCatalogues(
    @GetUser('sub') userId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.backCatalogueService.getBackCatalogues(userId, pg);
  }

  @Get(':catalogueId')
  @ApiOperation({
    summary: 'Get a single back catalogue entry',
    description:
      'Retrieve detailed information about a specific back catalogue entry',
  })
  @ApiParam({
    name: 'catalogueId',
    description: 'Back Catalogue ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entry fetched successfully',
    type: BackCatalogueResponseDto,
  })
  async getBackCatalogueById(
    @GetUser('sub') userId: string,
    @Param('catalogueId') catalogueId: string,
  ) {
    return this.backCatalogueService.getBackCatalogueById(userId, catalogueId);
  }

  @Get('release/:releaseId')
  @ApiOperation({
    summary: 'Get all back catalogue entries for a release',
    description:
      'Retrieve all back catalogue entries associated with a specific release',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entries fetched successfully',
    type: [BackCatalogueResponseDto],
  })
  async getBackCataloguesByRelease(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.backCatalogueService.getBackCataloguesByRelease(
      userId,
      releaseId,
    );
  }

  @Patch(':catalogueId')
  @ApiOperation({
    summary: 'Update a back catalogue entry',
    description: 'Update back catalogue information and metadata',
  })
  @ApiParam({
    name: 'catalogueId',
    description: 'Back Catalogue ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entry updated successfully',
    type: BackCatalogueResponseDto,
  })
  async updateBackCatalogue(
    @GetUser('sub') userId: string,
    @Param('catalogueId') catalogueId: string,
    @Body() dto: UpdateBackCatalogueDto,
  ) {
    return this.backCatalogueService.updateBackCatalogue(
      userId,
      catalogueId,
      dto,
    );
  }

  @Delete(':catalogueId')
  @ApiOperation({
    summary: 'Delete a back catalogue entry',
    description: 'Delete a back catalogue entry',
  })
  @ApiParam({
    name: 'catalogueId',
    description: 'Back Catalogue ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Back catalogue entry deleted successfully',
  })
  async deleteBackCatalogue(
    @GetUser('sub') userId: string,
    @Param('catalogueId') catalogueId: string,
  ) {
    return this.backCatalogueService.deleteBackCatalogue(userId, catalogueId);
  }
}
