import { Module } from '@nestjs/common';
import { AccountantModule } from './accountant';
import { AccountingModule } from './accounting';
import { AdminModule } from './admin';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { DistributionModule } from './distribution';
import { ReleaseModule } from './release';
import { UploadModule } from './upload/upload.module';
import { CommerceModule } from './commerce/commerce.module';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';

@Module({
  imports: [
    AuthModule,
    UploadModule,
    ReleaseModule,
    AccountingModule,
    AnalyticsModule,
    DistributionModule,
    AdminModule,
    AccountantModule,
    CommerceModule,
    CloudinaryModule,
  ],
})
export class MainModule {}
