import {
  successResponse,
  TResponse,
} from '@/common/utils/response.util';
import { AppError } from '@/core/error/handle-error.app';
import { HandleError } from '@/core/error/handle-error.decorator';
import { S3Service } from '@/lib/file/services/s3.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TrackResponseDto } from '../dto/release-response.dto';
import { CreateTrackDto, UpdateTrackDto } from '../dto/track.dto';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  @HandleError('Failed to create track', 'Track')
  async createTrack(
    userId: string,
    dto: CreateTrackDto,
  ): Promise<TResponse<TrackResponseDto>> {
    // Verify the release belongs to the user
    const release = await this.prisma.release.findUnique({
      where: { releaseId: dto.releaseId, userId },
    });

    if (!release) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'Release not found or does not belong to you',
      );
    }

    const { trackArtists, ...trackData } = dto;

    // Create track with nested artist relations
    const track = await this.prisma.track.create({
      data: {
        releaseId: dto.releaseId,
        trackNumber: trackData.trackNumber,
        trackTitle: trackData.trackTitle,
        trackGenre: trackData.trackGenre,
        trackMix: trackData.trackMix,
        explicitContent: trackData.explicitContent,
        trackLanguage: trackData.trackLanguage,
        trackPublisher: trackData.trackPublisher,
        originalReleaseDate: trackData.originalReleaseDate
          ? new Date(trackData.originalReleaseDate)
          : undefined,
        trackIsrc: trackData.trackIsrc,
        territoryRestrictions: trackData.territoryRestrictions,
        audioFileUrl: trackData.audioFileUrl,
        ...(trackArtists && {
          trackArtists: {
            create: trackArtists.map((artist) => ({
              artistId: artist.artistId,
              clientName: artist.clientName,
              nameOnTrack: artist.nameOnTrack,
              artistType: artist.artistType,
              songwriterRole: artist.songwriterRole,
              realName: artist.realName,
              masterSplit: artist.masterSplit,
              spotifyId: artist.spotifyId,
              appleId: artist.appleId,
            })),
          },
        }),
      },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    this.logger.log(
      `Track created: ${track.trackId} for release ${dto.releaseId}`,
    );

    return successResponse(
      track as any,
      'Track created successfully',
    );
  }

  @HandleError('Failed to upload track audio', 'Track')
  async uploadTrackAudio(
    userId: string,
    trackId: string,
    file: Express.Multer.File,
  ): Promise<TResponse<TrackResponseDto>> {
    // Verify track exists and belongs to user
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: { release: true },
    });

    if (!track) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    if (track.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this track',
      );
    }

    this.logger.log(
      `Uploading audio file for track ${trackId}: ${file.originalname} (${file.size} bytes)`,
    );

    // Upload file to S3
    const uploadedFile = await this.s3.uploadFile(file);

    this.logger.log(
      `Audio file uploaded successfully: ${uploadedFile.url}`,
    );

    // Update track with audio file URL and file ID
    const updatedTrack = await this.prisma.track.update({
      where: { trackId },
      data: {
        audioFileUrl: uploadedFile.url,
        audioFileId: uploadedFile.id,
      },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    this.logger.log(
      `Track ${trackId} updated with audio file ${uploadedFile.id}`,
    );

    return successResponse(
      {
        ...updatedTrack,
        uploadedFile: {
          id: uploadedFile.id,
          filename: uploadedFile.originalFilename,
          url: uploadedFile.url,
          size: uploadedFile.size,
          mimeType: uploadedFile.mimeType,
        },
      } as any,
      'Audio file uploaded successfully',
    );
  }

  @HandleError('Failed to delete track audio', 'Track')
  async deleteTrackAudio(
    userId: string,
    trackId: string,
  ): Promise<TResponse<any>> {
    // Verify track exists and belongs to user
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: { release: true },
    });

    if (!track) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    if (track.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this track',
      );
    }

    if (!track.audioFileId) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'No audio file associated with this track',
      );
    }

    // Delete file from S3
    await this.s3.deleteFile(track.audioFileId);

    // Update track to remove audio file references
    await this.prisma.track.update({
      where: { trackId },
      data: {
        audioFileUrl: null,
        audioFileId: null,
      },
    });

    this.logger.log(
      `Audio file deleted from track ${trackId} by user ${userId}`,
    );

    return successResponse(
      { trackId },
      'Audio file deleted successfully',
    );
  }

  @HandleError('Failed to get track', 'Track')
  async getTrackById(
    userId: string,
    trackId: string,
  ): Promise<TResponse<TrackResponseDto>> {
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: {
        release: true,
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!track) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    // Verify the track belongs to the user's release
    if (track.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this track',
      );
    }

    return successResponse(
      track as any,
      'Track fetched successfully',
    );
  }

  @HandleError('Failed to get release tracks', 'Track')
  async getTracksByRelease(
    userId: string,
    releaseId: string,
  ): Promise<TResponse<TrackResponseDto[]>> {
    // Verify the release belongs to the user
    const release = await this.prisma.release.findUnique({
      where: { releaseId, userId },
    });

    if (!release) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Release not found');
    }

    const tracks = await this.prisma.track.findMany({
      where: { releaseId },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { trackNumber: 'asc' },
    });

    return successResponse(
      tracks as any,
      'Tracks fetched successfully',
    );
  }

  @HandleError('Failed to update track', 'Track')
  async updateTrack(
    userId: string,
    trackId: string,
    dto: UpdateTrackDto,
  ): Promise<TResponse<TrackResponseDto>> {
    const existingTrack = await this.prisma.track.findUnique({
      where: { trackId },
      include: { release: true },
    });

    if (!existingTrack) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    // Verify the track belongs to the user's release
    if (existingTrack.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this track',
      );
    }

    const { trackArtists, ...trackData } = dto;

    // Update track
    const track = await this.prisma.track.update({
      where: { trackId },
      data: {
        ...trackData,
        ...(dto.originalReleaseDate && {
          originalReleaseDate: new Date(dto.originalReleaseDate),
        }),
      },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    // Update track artists if provided
    if (trackArtists) {
      await this.prisma.trackArtist.deleteMany({
        where: { trackId },
      });

      await this.prisma.trackArtist.createMany({
        data: trackArtists.map((artist) => ({
          trackId,
          artistId: artist.artistId,
          clientName: artist.clientName,
          nameOnTrack: artist.nameOnTrack,
          artistType: artist.artistType,
          songwriterRole: artist.songwriterRole,
          realName: artist.realName,
          masterSplit: artist.masterSplit,
          spotifyId: artist.spotifyId,
          appleId: artist.appleId,
        })),
      });
    }

    this.logger.log(`Track updated: ${trackId} by user ${userId}`);

    return successResponse(
      track as any,
      'Track updated successfully',
    );
  }

  @HandleError('Failed to get all tracks for admin/distributor', 'Track')
  async getAllTracksForAdmin(
    releaseId?: string,
  ): Promise<TResponse<TrackResponseDto[]>> {
    const where = releaseId ? { releaseId } : {};
    const tracks = await this.prisma.track.findMany({
      where,
      include: {
        release: true,
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { trackNumber: 'asc' },
    });

    return successResponse(
      tracks as any,
      'Tracks fetched successfully',
    );
  }

  @HandleError('Failed to get track for admin/distributor', 'Track')
  async getTrackByIdForAdmin(
    trackId: string,
  ): Promise<TResponse<TrackResponseDto>> {
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: {
        release: true,
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!track) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    return successResponse(
      track as any,
      'Track fetched successfully',
    );
  }

  @HandleError('Failed to get release tracks for admin/distributor', 'Track')
  async getTracksByReleaseForAdmin(
    releaseId: string,
  ): Promise<TResponse<TrackResponseDto[]>> {
    const tracks = await this.prisma.track.findMany({
      where: { releaseId },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { trackNumber: 'asc' },
    });

    return successResponse(
      tracks as any,
      'Tracks fetched successfully',
    );
  }

  @HandleError('Failed to update track for admin/distributor', 'Track')
  async updateTrackForAdmin(
    trackId: string,
    dto: UpdateTrackDto,
  ): Promise<TResponse<TrackResponseDto>> {
    const existingTrack = await this.prisma.track.findUnique({
      where: { trackId },
    });

    if (!existingTrack) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    const { trackArtists, ...trackData } = dto;

    const track = await this.prisma.track.update({
      where: { trackId },
      data: {
        ...trackData,
        ...(dto.originalReleaseDate && {
          originalReleaseDate: new Date(dto.originalReleaseDate),
        }),
      },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (trackArtists) {
      await this.prisma.trackArtist.deleteMany({
        where: { trackId },
      });

      await this.prisma.trackArtist.createMany({
        data: trackArtists.map((artist) => ({
          trackId,
          artistId: artist.artistId,
          clientName: artist.clientName,
          nameOnTrack: artist.nameOnTrack,
          artistType: artist.artistType,
          songwriterRole: artist.songwriterRole,
          realName: artist.realName,
          masterSplit: artist.masterSplit,
          spotifyId: artist.spotifyId,
          appleId: artist.appleId,
        })),
      });
    }

    this.logger.log(`Track updated by admin: ${trackId}`);

    const updatedTrack = await this.prisma.track.findUnique({
      where: { trackId },
      include: {
        trackArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    return successResponse(
      updatedTrack as any,
      'Track updated successfully',
    );
  }

  @HandleError('Failed to delete track', 'Track')
  async deleteTrack(
    userId: string,
    trackId: string,
  ): Promise<TResponse<any>> {
    const track = await this.prisma.track.findUnique({
      where: { trackId },
      include: { release: true },
    });

    if (!track) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Track not found');
    }

    // Verify the track belongs to the user's release
    if (track.release.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        'You do not have access to this track',
      );
    }

    // Delete associated audio file from S3 if exists
    if (track.audioFileId) {
      try {
        await this.s3.deleteFile(track.audioFileId);
        this.logger.log(`Deleted audio file ${track.audioFileId} from S3`);
      } catch (error) {
        this.logger.warn(
          `Failed to delete audio file ${track.audioFileId}: ${error.message}`,
        );
      }
    }

    await this.prisma.track.delete({
      where: { trackId },
    });

    this.logger.log(`Track deleted: ${trackId} by user ${userId}`);

    return successResponse(
      { trackId },
      'Track deleted successfully',
    );
  }
}