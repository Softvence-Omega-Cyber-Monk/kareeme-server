import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReleasesModule } from './releases/releases.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule, ReleasesModule],
})
export class MainModule {}
