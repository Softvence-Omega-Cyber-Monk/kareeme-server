import { Module } from '@nestjs/common';
import {
    AssetController,
    ClaimController,
    GeoTrendController,
    PlatformController,
} from './controllers/analytics.controller';

import {
    AssetService,
    ClaimService,
    GeoTrendService
} from './services/analytics-details.service';
import { PlatformAnalyticsService } from './services/platform.service';



@Module({
  imports: [],
  controllers: [
    PlatformController,
    AssetController,
    GeoTrendController,
    ClaimController,
  ],
  providers: [
    PlatformAnalyticsService,
    AssetService,
    GeoTrendService,
    ClaimService,
  ],
  exports: [
    PlatformAnalyticsService,
    AssetService,
    GeoTrendService,
    ClaimService,
  ],
})
export class AnalyticsModule {}