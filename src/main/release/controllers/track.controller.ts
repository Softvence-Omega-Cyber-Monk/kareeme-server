import { GetUser, ValidateAuth } from '@/core/jwt/jwt.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as multer from 'multer';
import { TrackResponseDto } from '../dto/release-response.dto';
import { CreateTrackDto, UpdateTrackDto, UploadTrackAudioDto } from '../dto/track.dto';
import { TrackService } from '../services/track.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Tracks')
@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new track',
    description:
      'Add a new track to a release with track information and artist metadata',
  })
  @ApiResponse({
    status: 201,
    description: 'Track created successfully',
    type: TrackResponseDto,
  })
  async createTrack(
    @GetUser('sub') userId: string,
    @Body() dto: CreateTrackDto,
  ) {
    return this.trackService.createTrack(userId, dto);
  }

  @Post(':trackId/upload-audio')
  @ApiOperation({
    summary: 'Upload audio file for a track',
    description:
      'Upload an audio file (MP3, WAV, FLAC, AAC) for a specific track. Max file size: 100MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTrackAudioDto })
  @ApiParam({
    name: 'trackId',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Audio file uploaded successfully',
    type: TrackResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('audioFile', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'audio/mpeg', // MP3
          'audio/wav', // WAV
          'audio/x-wav', // WAV alternative
          'audio/flac', // FLAC
          'audio/aac', // AAC
          'audio/mp4', // M4A
          'audio/x-m4a', // M4A alternative
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Only audio files (MP3, WAV, FLAC, AAC, M4A) are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadTrackAudio(
    @GetUser('sub') userId: string,
    @Param('trackId') trackId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    return this.trackService.uploadTrackAudio(userId, trackId, file);
  }

  @Get(':trackId')
  @ApiOperation({
    summary: 'Get a single track',
    description: 'Retrieve detailed information about a specific track',
  })
  @ApiParam({
    name: 'trackId',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Track fetched successfully',
    type: TrackResponseDto,
  })
  async getTrackById(
    @GetUser('sub') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.trackService.getTrackById(userId, trackId);
  }

  @Get('release/:releaseId')
  @ApiOperation({
    summary: 'Get all tracks for a release',
    description: 'Retrieve all tracks associated with a specific release',
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
  async getTracksByRelease(
    @GetUser('sub') userId: string,
    @Param('releaseId') releaseId: string,
  ) {
    return this.trackService.getTracksByRelease(userId, releaseId);
  }

  @Patch(':trackId')
  @ApiOperation({
    summary: 'Update a track',
    description: 'Update track information or artist metadata',
  })
  @ApiParam({
    name: 'trackId',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Track updated successfully',
    type: TrackResponseDto,
  })
  async updateTrack(
    @GetUser('sub') userId: string,
    @Param('trackId') trackId: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.trackService.updateTrack(userId, trackId, dto);
  }

  @Delete(':trackId')
  @ApiOperation({
    summary: 'Delete a track',
    description: 'Delete a track from a release',
  })
  @ApiParam({
    name: 'trackId',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Track deleted successfully',
  })
  async deleteTrack(
    @GetUser('sub') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.trackService.deleteTrack(userId, trackId);
  }

  @Delete(':trackId/audio')
  @ApiOperation({
    summary: 'Delete audio file from a track',
    description: 'Remove the audio file associated with a track',
  })
  @ApiParam({
    name: 'trackId',
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Audio file deleted successfully',
  })
  async deleteTrackAudio(
    @GetUser('sub') userId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.trackService.deleteTrackAudio(userId, trackId);
  }
}