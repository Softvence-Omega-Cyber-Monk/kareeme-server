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
import { ArtistResponseDto, CreateArtistDto, UpdateArtistDto } from '../dto/artist.dto';
import { ArtistService } from '../services/artist.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Artists')
@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new artist',
    description:
      'Create a new artist profile with basic information',
  })
  @ApiResponse({
    status: 201,
    description: 'Artist created successfully',
    type: ArtistResponseDto,
  })
  async createArtist(
    @GetUser('sub') userId: string,
    @Body() dto: CreateArtistDto,
  ) {
    return this.artistService.createArtist(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all artists',
    description:
      'Retrieve a paginated list of all artists for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Artists fetched successfully',
    type: [ArtistResponseDto],
  })
  async getArtists(
    @GetUser('sub') userId: string,
    @Query() pg: PaginationDto,
  ) {
    return this.artistService.getArtists(userId, pg);
  }

  @Get(':artistId')
  @ApiOperation({
    summary: 'Get a single artist',
    description: 'Retrieve detailed information about a specific artist',
  })
  @ApiParam({
    name: 'artistId',
    description: 'Artist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist fetched successfully',
    type: ArtistResponseDto,
  })
  async getArtistById(
    @GetUser('sub') userId: string,
    @Param('artistId') artistId: string,
  ) {
    return this.artistService.getArtistById(userId, artistId);
  }

  @Patch(':artistId')
  @ApiOperation({
    summary: 'Update an artist',
    description: 'Update artist information',
  })
  @ApiParam({
    name: 'artistId',
    description: 'Artist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist updated successfully',
    type: ArtistResponseDto,
  })
  async updateArtist(
    @GetUser('sub') userId: string,
    @Param('artistId') artistId: string,
    @Body() dto: UpdateArtistDto,
  ) {
    return this.artistService.updateArtist(userId, artistId, dto);
  }

  @Delete(':artistId')
  @ApiOperation({
    summary: 'Delete an artist',
    description:
      'Delete an artist. Artist must not be associated with any releases or tracks.',
  })
  @ApiParam({
    name: 'artistId',
    description: 'Artist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Artist deleted successfully',
  })
  async deleteArtist(
    @GetUser('sub') userId: string,
    @Param('artistId') artistId: string,
  ) {
    return this.artistService.deleteArtist(userId, artistId);
  }
}