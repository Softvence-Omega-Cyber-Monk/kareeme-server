import { Global, Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { GlobalSettingsService } from './services/global-settings.service';
import { InitialUserSeedService } from './services/initial-user-seed.service';

@Global()
@Module({
  imports: [],
  providers: [FileService, GlobalSettingsService, InitialUserSeedService],
})
export class SeedModule {}
