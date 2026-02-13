import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ClientResponseDto,
  CreateClientDto,
} from '../dto/client.dto';
import { ClientService } from '../services';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Distribution - Clients')
@Controller('distribution/clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @ApiOperation({
    summary: 'Create client',
    description: 'Create a new client account with OTP',
  })
  @ApiResponse({ status: 201, type: ClientResponseDto })
  async createClient(
    @GetUser('sub') distributorId: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientService.createClient(distributorId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get clients',
    description: 'Get paginated list of active clients',
  })
  @ApiResponse({ status: 200, type: [ClientResponseDto] })
  async getClients(
    @GetUser('sub') distributorId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.clientService.getClients(distributorId, pg);
  }

  @Patch(':clientId/deactivate')
  @ApiOperation({
    summary: 'Deactivate client',
    description: 'Deactivate a client account',
  })
  @ApiParam({ name: 'clientId' })
  @ApiResponse({ status: 200 })
  async deactivateClient(
    @GetUser('sub') distributorId: string,
    @Param('clientId') clientId: string,
  ) {
    return this.clientService.deactivateClient(distributorId, clientId);
  }
}
