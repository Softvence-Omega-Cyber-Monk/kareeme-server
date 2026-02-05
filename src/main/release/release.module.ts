import { FileModule } from '@/lib/file/file.module';
import { Module } from '@nestjs/common';
import { ArtistController } from './controllers/artist.controller';
import { BackCatalogueController } from './controllers/back-catalogue.controller';
import { ReleaseController } from './controllers/release.controller';
import { SplitSheetController } from './controllers/split-sheet.controller';
import { TrackController } from './controllers/track.controller';
import { ArtistService } from './services/artist.service';
import { BackCatalogueService } from './services/back-catalogue.service';
import { ReleaseService } from './services/release.service';
import { SplitSheetService } from './services/split-sheet.service';
import { TrackService } from './services/track.service';

@Module({
  imports: [FileModule], // Import FileModule to access S3Service
  controllers: [
    ArtistController,
    ReleaseController,
    TrackController,
    SplitSheetController,
    BackCatalogueController,
  ],
  providers: [
    ArtistService,
    ReleaseService,
    TrackService,
    SplitSheetService,
    BackCatalogueService,
  ],
  exports: [
    ArtistService,
    ReleaseService,
    TrackService,
    SplitSheetService,
    BackCatalogueService,
  ],
})
export class ReleaseModule {}