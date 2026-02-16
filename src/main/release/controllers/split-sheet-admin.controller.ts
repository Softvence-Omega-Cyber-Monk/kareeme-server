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
  SplitSheetResponseDto,
  UpdateSplitSheetDto,
} from '../dto/split-sheet.dto';
import { SplitSheetService } from '../services/split-sheet.service';

@ApiTags('Split Sheets - Admin/Distributor')
@ApiBearerAuth()
@Controller('admin/split-sheets')
@ValidateAuth(UserEnum.ADMIN, UserEnum.DISTRIBUTOR, UserEnum.SUPER_ADMIN)
export class SplitSheetAdminController {
  constructor(private readonly splitSheetService: SplitSheetService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all split sheets (admin/distributor only)',
    description:
      'Retrieve all split sheet agreements with pagination. Accessible by admin and distributor roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheets fetched successfully',
    type: [SplitSheetResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getAllSplitSheets(@Query() pg: PaginationDto) {
    return this.splitSheetService.getAllSplitSheetsForAdmin(pg);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get split sheet by ID (admin/distributor only)',
    description:
      'Retrieve detailed information about any split sheet by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Split Sheet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheet fetched successfully',
    type: SplitSheetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Split sheet not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async getSplitSheetById(@Param('id') id: string) {
    return this.splitSheetService.getSplitSheetByIdForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update split sheet by ID (admin/distributor only)',
    description:
      'Update any split sheet by ID. Accessible by admin and distributor roles.',
  })
  @ApiParam({
    name: 'id',
    description: 'Split Sheet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheet updated successfully',
    type: SplitSheetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Split sheet not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires admin or distributor role',
  })
  async updateSplitSheet(
    @Param('id') id: string,
    @Body() dto: UpdateSplitSheetDto,
  ) {
    return this.splitSheetService.updateSplitSheetForAdmin(id, dto);
  }
}
