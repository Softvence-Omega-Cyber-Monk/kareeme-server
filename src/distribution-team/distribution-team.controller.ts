import { Controller } from '@nestjs/common';
import { DistributionTeamService } from './distribution-team.service';

@Controller('distribution-team')
export class DistributionTeamController {
  constructor(private readonly distributionTeamService: DistributionTeamService) {}
}
