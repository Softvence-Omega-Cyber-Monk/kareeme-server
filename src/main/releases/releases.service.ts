import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { UploadService } from '../upload/upload.service';
import { CreateReleaseFormDataDto } from './dto/create-release-form.dto';
import {
  ExportFormat,
  ExportReleasesQueryDto,
  GetReleasesQueryDto,
  GetSplitSheetsQueryDto,
} from './dto/query-release.dto';

@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  /**
   * Create a complete release with all related data and file uploads in a transaction
   */
  async createReleaseWithFiles(
    dto: CreateReleaseFormDataDto,
    files: Express.Multer.File[],
  ) {
    try {
      this.logger.log(`Creating release with ${files?.length || 0} files`);
      this.logger.log(`Received files:`, files?.map(f => ({ name: f.originalname, size: f.size, mimetype: f.mimetype })));

      // Validate track data
      if (dto.tracks && dto.tracks.length > 0) {
        this.logger.log(`Validating ${dto.tracks.length} track(s)...`);
        
        for (let i = 0; i < dto.tracks.length; i++) {
          const track = dto.tracks[i];
          this.logger.log(`Track ${i}:`, JSON.stringify(track));

          if (
            track.audioFileIndex !== undefined &&
            track.audioFileIndex !== null &&
            track.audioFileIndex !== ''
          ) {
            const fileIndex = parseInt(track.audioFileIndex, 10);
            if (
              isNaN(fileIndex) ||
              fileIndex < 0 ||
              fileIndex >= (files?.length || 0)
            ) {
              throw new BadRequestException(
                `Invalid audioFileIndex "${track.audioFileIndex}" for track "${track.trackTitle || 'Unknown'}". ` +
                  `Must be between 0 and ${(files?.length || 1) - 1}. Available files: ${files?.length || 0}`,
              );
            }
          }
        }
      }

      // Upload all files first if any
      const uploadedFiles: Record<number, any> = {};
      if (files && files.length > 0) {
        this.logger.log(`Uploading ${files.length} audio files...`);

        for (let i = 0; i < files.length; i++) {
          try {
            this.logger.log(`Uploading file ${i}: ${files[i].originalname}`);
            const result = await this.uploadService.uploadFiles([files[i]]);
            
            this.logger.log(`Upload result structure:`, {
              success: result.success,
              hasData: !!result.data,
              hasFiles: !!(result.data && result.data.files),
              filesCount: result.data?.files?.length,
            });

            if (result.data && result.data.files && result.data.files[0]) {
              uploadedFiles[i] = result.data.files[0];
              this.logger.log(`Successfully uploaded file ${i}:`, {
                id: uploadedFiles[i].id,
                filename: uploadedFiles[i].filename,
                url: uploadedFiles[i].url,
                size: uploadedFiles[i].size,
              });
            } else {
              this.logger.error(`Upload result missing expected structure for file ${i}:`, result);
              throw new BadRequestException(
                `Failed to upload audio file at index ${i}: Invalid response structure from upload service`,
              );
            }
          } catch (error) {
            this.logger.error(`Failed to upload file at index ${i}:`, error);
            throw new BadRequestException(
              `Failed to upload audio file at index ${i}: ${error.message}`,
            );
          }
        }

        this.logger.log(`All files uploaded successfully. File mapping:`, 
          Object.keys(uploadedFiles).map(key => {
            const numKey = parseInt(key, 10);
            return {
              index: key,
              url: uploadedFiles[numKey].url,
              id: uploadedFiles[numKey].id,
            };
          })
        );
      }

      // Create release with transaction
      return await this.prisma.$transaction(async (tx: any) => {
      // 1. Create the release
      const release = await tx.release.create({
        data: {
          userId: dto.userId,
          releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
          preOrderDate: dto.preOrderDate ? new Date(dto.preOrderDate) : null,
          releaseTitle: dto.releaseTitle,
          typeOfRelease: dto.typeOfRelease,
          genre: dto.genre,
          language: dto.language,
          isExplicitContent: dto.isExplicitContent,
          hasExternalRightsHolder: dto.hasExternalRightsHolder,
          hasDolbyAtmosVersion: dto.hasDolbyAtmosVersion,
          hasExtendedMixForDjStores: dto.hasExtendedMixForDjStores,
          additionalDetails: dto.additionalDetails,
          hasArtistOnSpotify: dto.hasArtistOnSpotify,
          hasMusicVideo: dto.hasMusicVideo,
          status: dto.status || 'PENDING',
        },
      });

      this.logger.log(`Release created with ID: ${release.releaseId}`);

      // 2. Create release artists
      if (dto.releaseArtists && dto.releaseArtists.length > 0) {
        this.logger.log(`Processing ${dto.releaseArtists.length} release artist(s)...`);
        
        for (let i = 0; i < dto.releaseArtists.length; i++) {
          const releaseArtist = dto.releaseArtists[i];
          this.logger.log(`Release artist ${i}:`, JSON.stringify(releaseArtist));

          // Skip empty artist objects
          if (!releaseArtist || (Object.keys(releaseArtist).length === 0)) {
            this.logger.warn(`Skipping empty release artist at index ${i}`);
            continue;
          }

          // Only validate if the artist object has data
          if (releaseArtist.artistId || releaseArtist.artist) {
            let artistId = releaseArtist.artistId;

            // Create new artist if artist data is provided
            if (!artistId && releaseArtist.artist) {
              const newArtist = await tx.artist.create({
                data: releaseArtist.artist,
              });
              artistId = newArtist.artistId;
              this.logger.log(`Created new artist with ID: ${artistId}`);
            }

            if (artistId) {
              await tx.releaseArtist.create({
                data: {
                  releaseId: release.releaseId,
                  artistId: artistId,
                  role: releaseArtist.role,
                },
              });
              this.logger.log(`Linked artist ${artistId} to release`);
            }
          }
        }
      }

      // 3. Create release territories
      if (dto.releaseTerritories && dto.releaseTerritories.length > 0) {
        this.logger.log(`Processing ${dto.releaseTerritories.length} territory(ies)...`);
        
        // Filter out empty territories and validate non-empty ones
        const validTerritories = dto.releaseTerritories.filter((t: any) => t && t.territory);
        
        this.logger.log(`Found ${validTerritories.length} valid territories out of ${dto.releaseTerritories.length}`);
        
        if (validTerritories.length > 0) {
          await tx.releaseTerritory.createMany({
            data: validTerritories.map((territory: any) => ({
              releaseId: release.releaseId,
              territory: territory.territory,
            })),
          });
        }
      }

      // 4. Create tracks with track artists and link to uploaded audio files
      const createdTracks: string[] = [];
      if (dto.tracks && dto.tracks.length > 0) {
        this.logger.log(`Creating ${dto.tracks.length} track(s)...`);
        
        for (const track of dto.tracks) {
          // Get audio file URL if index is provided
          let audioFileUrl: string | undefined = undefined;
          
          if (track.audioFileIndex !== undefined && track.audioFileIndex !== null && track.audioFileIndex !== '') {
            const fileIndex = parseInt(track.audioFileIndex, 10);
            if (!isNaN(fileIndex) && uploadedFiles[fileIndex]) {
              audioFileUrl = uploadedFiles[fileIndex].url;
              this.logger.log(`Track "${track.trackTitle}" (index ${fileIndex}) linked to audio file: ${audioFileUrl}`);
            } else {
              this.logger.warn(`Track "${track.trackTitle}" has audioFileIndex="${track.audioFileIndex}" but no uploaded file found at that index`);
            }
          }

          const createdTrack = await tx.track.create({
            data: {
              releaseId: release.releaseId,
              trackNumber: track.trackNumber,
              trackTitle: track.trackTitle,
              trackGenre: track.trackGenre,
              trackMix: track.trackMix,
              explicitContent: track.explicitContent,
              trackLanguage: track.trackLanguage,
              trackPublisher: track.trackPublisher,
              originalReleaseDate: track.originalReleaseDate
                ? new Date(track.originalReleaseDate)
                : null,
              trackIsrc: track.trackIsrc,
              territoryRestrictions: track.territoryRestrictions,
              audioFileUrl: audioFileUrl,
            },
          });

          this.logger.log(`Created track "${track.trackTitle}" with ID: ${createdTrack.trackId}, audioFileUrl: ${audioFileUrl || 'none'}`);

          createdTracks.push(createdTrack.trackId);

          // Create track artists
          if (track.trackArtists && track.trackArtists.length > 0) {
            for (const trackArtist of track.trackArtists) {
              let artistId = trackArtist.artistId;

              // Create new artist if artist data is provided
              if (!artistId && trackArtist.artist) {
                const newArtist = await tx.artist.create({
                  data: trackArtist.artist,
                });
                artistId = newArtist.artistId;
              }

              if (artistId) {
                await tx.trackArtist.create({
                  data: {
                    trackId: createdTrack.trackId,
                    artistId: artistId,
                    clientName: trackArtist.clientName,
                    nameOnTrack: trackArtist.nameOnTrack,
                    artistType: trackArtist.artistType,
                    songwriterRole: trackArtist.songwriterRole,
                    realName: trackArtist.realName,
                    masterSplit: trackArtist.masterSplit,
                    spotifyId: trackArtist.spotifyId,
                    appleId: trackArtist.appleId,
                  },
                });
              }
            }
          }
        }
      }

      // 5. Create split sheet agreements or auto-generate them
      if (dto.splitSheetAgreements && dto.splitSheetAgreements.length > 0) {
        this.logger.log(`Processing ${dto.splitSheetAgreements.length} split sheet(s)...`);
        
        // Filter out empty split sheets
        const validSplitSheets = dto.splitSheetAgreements.filter(
          (ss: any) => ss && (ss.songTitle || ss.isrc || ss.contributors?.length > 0),
        );
        
        this.logger.log(`Found ${validSplitSheets.length} valid split sheets out of ${dto.splitSheetAgreements.length}`);

        // Use provided split sheets
        for (let i = 0; i < validSplitSheets.length; i++) {
          const splitSheet = validSplitSheets[i];
          
          let recordLabelId = splitSheet.recordLabelId;

          // Create new label if label data is provided
          if (!recordLabelId && splitSheet.recordLabel) {
            const newLabel = await tx.label.create({
              data: splitSheet.recordLabel,
            });
            recordLabelId = newLabel.labelId;
          }

          const createdSplitSheet = await tx.splitSheetAgreement.create({
            data: {
              releaseId: release.releaseId,
              songTitle: splitSheet.songTitle,
              isrc: splitSheet.isrc,
              releaseDate: splitSheet.releaseDate ? new Date(splitSheet.releaseDate) : null,
              recordLabelId: recordLabelId,
            },
          });

          // Create contributors
          if (splitSheet.contributors && splitSheet.contributors.length > 0) {
            await tx.contributor.createMany({
              data: splitSheet.contributors.map((contributor: any) => ({
                splitId: createdSplitSheet.splitId,
                fullName: contributor.fullName,
                contribution: contributor.contribution,
                email: contributor.email,
                phone: contributor.phone,
                address: contributor.address,
                publisher: contributor.publisher,
                affiliation: contributor.affiliation,
                ipiCaeNumber: contributor.ipiCaeNumber,
                percentageSplit: contributor.percentageSplit,
              })),
            });
          }
        }
      } else if (createdTracks.length > 0) {
        // Auto-generate split sheets for tracks if none were provided
        this.logger.log(`Auto-generating split sheets for ${createdTracks.length} tracks...`);
        
        for (const trackId of createdTracks) {
          const track = await tx.track.findUnique({
            where: { trackId },
            include: { trackArtists: true },
          });

          if (track) {
            await tx.splitSheetAgreement.create({
              data: {
                releaseId: release.releaseId,
                songTitle: track.trackTitle || 'Untitled',
                isrc: track.trackIsrc,
                releaseDate: track.originalReleaseDate,
              },
            });
          }
        }
      }

      // 6. Create back catalogue entries
      if (dto.backCatalogue && dto.backCatalogue.length > 0) {
        this.logger.log(`Processing ${dto.backCatalogue.length} back catalogue entries...`);
        
        const validBackCatalogue = dto.backCatalogue.filter(
          (bc: any) => bc && Object.keys(bc).length > 0,
        );

        if (validBackCatalogue.length > 0) {
          await tx.backCatalogue.createMany({
            data: validBackCatalogue.map((catalogue: any) => ({
              releaseId: release.releaseId,
              labelName: catalogue.labelName,
              distributor: catalogue.distributor,
              upc: catalogue.upc,
              catalogueNumber: catalogue.catalogueNumber,
              releaseArtist: catalogue.releaseArtist,
              releaseTitle: catalogue.releaseTitle,
              releaseType: catalogue.releaseType,
              releaseDate: catalogue.releaseDate ? new Date(catalogue.releaseDate) : null,
              releasePLine: catalogue.releasePLine,
              releaseCLine: catalogue.releaseCLine,
            })),
          });
        }
      }

      // 7. Fetch and return the complete release
      const completeRelease = await tx.release.findUnique({
        where: { releaseId: release.releaseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          releaseArtists: {
            include: {
              artist: true,
            },
          },
          releaseTerritories: true,
          tracks: {
            include: {
              trackArtists: {
                include: {
                  artist: true,
                },
              },
            },
            orderBy: {
              trackNumber: 'asc',
            },
          },
          splitSheetAgreements: {
            include: {
              contributors: true,
              recordLabel: true,
            },
          },
          backCatalogue: true,
        },
      });

      this.logger.log(`Release created successfully with ${completeRelease.tracks.length} tracks`);
      
      // Log track audio file URLs for verification
      completeRelease.tracks.forEach((track: any) => {
        this.logger.log(`Track ${track.trackNumber} "${track.trackTitle}": audioFileUrl = ${track.audioFileUrl || 'none'}`);
      });

      return completeRelease;
    });
    } catch (error) {
      this.logger.error('Error creating release:', error);
      throw error;
    }
  }

  /**
   * Get all releases with filtering
   */
  async getAllReleases(query: GetReleasesQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      genre,
      status,
      typeOfRelease,
      userId,
      year,
    } = query;

    const where: Prisma.ReleaseWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { releaseTitle: { contains: search, mode: 'insensitive' } },
        { genre: { contains: search, mode: 'insensitive' } },
        {
          releaseArtists: {
            some: {
              artist: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    // Genre filter
    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Type of release filter
    if (typeOfRelease) {
      where.typeOfRelease = typeOfRelease;
    }

    // User filter
    if (userId) {
      where.userId = userId;
    }

    // Year filter
    if (year) {
      where.releaseDate = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }

    const [total, releases] = await Promise.all([
      this.prisma.release.count({ where }),
      this.prisma.release.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          releaseArtists: {
            include: {
              artist: true,
            },
          },
          releaseTerritories: true,
          tracks: {
            include: {
              trackArtists: {
                include: {
                  artist: true,
                },
              },
            },
            orderBy: {
              trackNumber: 'asc',
            },
          },
          splitSheetAgreements: {
            include: {
              contributors: true,
              recordLabel: true,
            },
          },
          backCatalogue: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: releases,
      metadata: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single release by ID
   */
  async getReleaseById(releaseId: string) {
    const release = await this.prisma.release.findUnique({
      where: { releaseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        releaseArtists: {
          include: {
            artist: true,
          },
        },
        releaseTerritories: true,
        tracks: {
          include: {
            trackArtists: {
              include: {
                artist: true,
              },
            },
          },
          orderBy: {
            trackNumber: 'asc',
          },
        },
        splitSheetAgreements: {
          include: {
            contributors: true,
            recordLabel: true,
          },
        },
        backCatalogue: true,
      },
    });

    if (!release) {
      throw new NotFoundException(`Release with ID ${releaseId} not found`);
    }

    return release;
  }

  /**
   * Get all split sheets with filtering
   */
  async getAllSplitSheets(query: GetSplitSheetsQueryDto) {
    const { page = 1, limit = 10, search, releaseId } = query;

    const where: Prisma.SplitSheetAgreementWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { songTitle: { contains: search, mode: 'insensitive' } },
        { isrc: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Release filter
    if (releaseId) {
      where.releaseId = releaseId;
    }

    const [total, splitSheets] = await Promise.all([
      this.prisma.splitSheetAgreement.count({ where }),
      this.prisma.splitSheetAgreement.findMany({
        where,
        include: {
          release: {
            select: {
              releaseId: true,
              releaseTitle: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          contributors: true,
          recordLabel: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: splitSheets,
      metadata: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single split sheet by ID
   */
  async getSplitSheetById(splitId: string) {
    const splitSheet = await this.prisma.splitSheetAgreement.findUnique({
      where: { splitId },
      include: {
        release: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            releaseArtists: {
              include: {
                artist: true,
              },
            },
            tracks: true,
          },
        },
        contributors: true,
        recordLabel: true,
      },
    });

    if (!splitSheet) {
      throw new NotFoundException(`Split sheet with ID ${splitId} not found`);
    }

    return splitSheet;
  }

  /**
   * Export releases to CSV, Excel, or PDF
   */
  async exportReleases(query: ExportReleasesQueryDto) {
    const { format = ExportFormat.CSV, ...filters } = query;

    // Get all releases without pagination for export
    const { data: releases } = await this.getAllReleases({
      ...filters,
      limit: 10000, // Large limit for export
    });

    // Flatten data for export
    const exportData = releases.map((release: any) => ({
      'Release ID': release.releaseId,
      'Release Title': release.releaseTitle || '',
      Type: release.typeOfRelease || '',
      Genre: release.genre || '',
      Language: release.language || '',
      Status: release.status || '',
      'Release Date': release.releaseDate
        ? release.releaseDate.toISOString().split('T')[0]
        : '',
      'Pre-order Date': release.preOrderDate
        ? release.preOrderDate.toISOString().split('T')[0]
        : '',
      'User Name': release.user.name,
      'User Email': release.user.email,
      Artists: release.releaseArtists
        .map((ra: any) => ra.artist.name)
        .join(', '),
      'Tracks Count': release.tracks.length,
      'Split Sheets Count': release.splitSheetAgreements.length,
      'Explicit Content': release.isExplicitContent ? 'Yes' : 'No',
      'Dolby Atmos': release.hasDolbyAtmosVersion ? 'Yes' : 'No',
      'Created At': release.createdAt.toISOString(),
    }));

    switch (format) {
      case ExportFormat.CSV:
        return this.exportToCSV(exportData);
      case ExportFormat.EXCEL:
        return this.exportToExcel(exportData);
      default:
        return this.exportToCSV(exportData);
    }
  }

  private exportToCSV(data: any[]) {
    const parser = new Parser();
    const csv = parser.parse(data);
    return {
      content: csv,
      filename: `releases-export-${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv',
    };
  }

  private async exportToExcel(data: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Releases');

    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    // Auto-fit columns
    worksheet.columns.forEach((column: any) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      content: buffer,
      filename: `releases-export-${new Date().toISOString().split('T')[0]}.xlsx`,
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}