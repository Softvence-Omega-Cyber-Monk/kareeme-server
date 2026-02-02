import { Injectable, Logger } from '@nestjs/common';
import { FileService } from './services/file.service';
import { GlobalSettingsService } from './services/global-settings.service';
import { InitialUserSeedService } from './services/initial-user-seed.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly globalSettingsService: GlobalSettingsService,
    private readonly initialUserSeedService: InitialUserSeedService,
  ) {}

  async seed() {
    this.logger.log('Starting seeding process...');

    try {
      await this.globalSettingsService.seedGlobalSettings();
      await this.initialUserSeedService.seedInitialUsers();
      this.logger.log('Seeding completed successfully.');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
    }
  }
}
