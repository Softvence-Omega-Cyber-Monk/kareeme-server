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
import {
  CreateStatementDto,
  StatementListItemDto,
  StatementResponseDto,
  StatementSummaryDto,
  UpdateStatementDto,
} from '../dto/statement.dto';
import { StatementDetailsDto } from '../dto/accounting-details.dto';
import { StatementService } from '../services/statement.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Accounting - Statements')
@Controller('accounting/statements')
export class StatementController {
  constructor(private readonly statementService: StatementService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new statement',
    description: 'Create a monthly royalty statement for the user',
  })
  @ApiResponse({
    status: 201,
    description: 'Statement created successfully',
    type: StatementResponseDto,
  })
  async createStatement(
    @GetUser('sub') userId: string,
    @Body() dto: CreateStatementDto,
  ) {
    return this.statementService.createStatement(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all statements',
    description: 'Retrieve a paginated list of all statements for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Statements fetched successfully',
    type: [StatementListItemDto],
  })
  async getStatements(
    @GetUser('sub') userId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.statementService.getStatements(userId, pg);
  }

  @Get('summaries')
  @ApiOperation({
    summary: 'Get statement summaries by year',
    description: 'Get annual statement summaries with totals',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement summaries fetched successfully',
    type: [StatementSummaryDto],
  })
  async getStatementSummaries(@GetUser('sub') userId: string) {
    return this.statementService.getStatementSummaries(userId);
  }

  @Get(':statementId')
  @ApiOperation({
    summary: 'Get a single statement',
    description: 'Retrieve detailed information about a specific statement',
  })
  @ApiParam({
    name: 'statementId',
    description: 'Statement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement fetched successfully',
    type: StatementResponseDto,
  })
  async getStatementById(
    @GetUser('sub') userId: string,
    @Param('statementId') statementId: string,
  ) {
    return this.statementService.getStatementById(userId, statementId);
  }

  @Get(':statementId/details')
  @ApiOperation({
    summary: 'Get statement details',
    description:
      'Retrieve complete statement details including releases, tracks, territories, platforms, and deal statuses',
  })
  @ApiParam({
    name: 'statementId',
    description: 'Statement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement details fetched successfully',
    type: StatementDetailsDto,
  })
  async getStatementDetails(
    @GetUser('sub') userId: string,
    @Param('statementId') statementId: string,
  ) {
    return this.statementService.getStatementDetails(userId, statementId);
  }

  @Patch(':statementId')
  @ApiOperation({
    summary: 'Update a statement',
    description: 'Update statement status, amounts, or other information',
  })
  @ApiParam({
    name: 'statementId',
    description: 'Statement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement updated successfully',
    type: StatementResponseDto,
  })
  async updateStatement(
    @GetUser('sub') userId: string,
    @Param('statementId') statementId: string,
    @Body() dto: UpdateStatementDto,
  ) {
    return this.statementService.updateStatement(userId, statementId, dto);
  }

  @Delete(':statementId')
  @ApiOperation({
    summary: 'Delete a statement',
    description: 'Delete a statement and all associated data',
  })
  @ApiParam({
    name: 'statementId',
    description: 'Statement ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement deleted successfully',
  })
  async deleteStatement(
    @GetUser('sub') userId: string,
    @Param('statementId') statementId: string,
  ) {
    return this.statementService.deleteStatement(userId, statementId);
  }
}
