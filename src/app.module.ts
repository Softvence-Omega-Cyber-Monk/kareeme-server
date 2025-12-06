import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DistributionTeamModule } from './distribution-team/distribution-team.module';

@Module({
  imports: [DistributionTeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
