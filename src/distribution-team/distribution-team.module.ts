import { Module } from '@nestjs/common';
import { DistributionTeamService } from './distribution-team.service';
import { DistributionTeamController } from './distribution-team.controller';

@Module({
  controllers: [DistributionTeamController],
  providers: [DistributionTeamService],
})
export class DistributionTeamModule {}
