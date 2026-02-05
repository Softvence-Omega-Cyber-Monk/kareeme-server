import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReleaseModule } from './release';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule, ReleaseModule],
})
export class MainModule {}
