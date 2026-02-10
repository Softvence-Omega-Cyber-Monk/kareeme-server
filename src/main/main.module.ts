import { Module } from '@nestjs/common';
import { AccountingModule } from './accounting';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { DistributionModule } from './distribution';
import { ReleaseModule } from './release';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule, ReleaseModule, AccountingModule, AnalyticsModule, DistributionModule],
})
export class MainModule {}
