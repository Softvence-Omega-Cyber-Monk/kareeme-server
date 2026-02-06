import { Module } from '@nestjs/common';
import { AccountingModule } from './accounting';
import { AuthModule } from './auth/auth.module';
import { ReleaseModule } from './release';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, UploadModule, ReleaseModule, AccountingModule],
})
export class MainModule {}
