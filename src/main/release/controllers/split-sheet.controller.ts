import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateSplitSheetDto,
  SplitSheetResponseDto,
  UpdateSplitSheetDto,
} from '../dto/split-sheet.dto';
import { SplitSheetService } from '../services/split-sheet.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Split Sheets')
@Controller('split-sheets')
export class SplitSheetController {
  constructor(private readonly splitSheetService: SplitSheetService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a split sheet agreement',
    description:
      'Create a new split sheet agreement for a release with contributors and their percentage splits. Total splits must equal 100%.',
  })
  @ApiResponse({
    status: 201,
    description: 'Split sheet created successfully',
    type: SplitSheetResponseDto,
  })
  async createSplitSheet(
    @GetUser('sub') userId: string,
    @Body() dto: CreateSplitSheetDto,
  ) {
    return this.splitSheetService.createSplitSheet(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all split sheets',
    description: 'Retrieve all split sheet agreements in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'All split sheets fetched successfully',
    type: [SplitSheetResponseDto],
  })
  async getAllSplitSheets() {
    return this.splitSheetService.getAllSplitSheets();
  }

  @Get(':splitId')
  @ApiOperation({
    summary: 'Get a split sheet agreement',
    description:
      'Retrieve detailed information about a specific split sheet including all contributors',
  })
  @ApiParam({
    name: 'splitId',
    description: 'Split Sheet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheet fetched successfully',
    type: SplitSheetResponseDto,
  })
  async getSplitSheetById(
    @GetUser('sub') userId: string,
    @Param('splitId') splitId: string,
  ) {
    return this.splitSheetService.getSplitSheetById(userId, splitId);
  }

  @Get('release/:releaseId')
  @ApiOperation({
    summary: 'Get all split sheets for a release',
    description:
      'Retrieve all split sheet agreements associated with a specific release',
  })
  @ApiParam({
    name: 'releaseId',
    description: 'Release ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheets fetched successfully',
    type: [SplitSheetResponseDto],
  })
  async getSplitSheetsByRelease(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.splitSheetService.getSplitSheetsByRelease(userId, releaseId);
  }

  @Patch(':splitId')
  @ApiOperation({
    summary: 'Update a split sheet agreement',
    description:
      'Update split sheet information or contributors. If updating contributors, total splits must equal 100%.',
  })
  @ApiParam({
    name: 'splitId',
    description: 'Split Sheet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheet updated successfully',
    type: SplitSheetResponseDto,
  })
  async updateSplitSheet(
    @GetUser('sub') userId: string,
    @Param('splitId') splitId: string,
    @Body() dto: UpdateSplitSheetDto,
  ) {
    return this.splitSheetService.updateSplitSheet(userId, splitId, dto);
  }

  @Delete(':splitId')
  @ApiOperation({
    summary: 'Delete a split sheet agreement',
    description:
      'Delete a split sheet agreement and all associated contributors',
  })
  @ApiParam({
    name: 'splitId',
    description: 'Split Sheet ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Split sheet deleted successfully',
  })
  async deleteSplitSheet(
    @GetUser('sub') userId: string,
    @Param('splitId') splitId: string,
  ) {
    return this.splitSheetService.deleteSplitSheet(userId, splitId);
  }
}
