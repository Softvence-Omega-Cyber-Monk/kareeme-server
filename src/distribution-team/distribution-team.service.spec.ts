import { Test, TestingModule } from '@nestjs/testing';
import { DistributionTeamService } from './distribution-team.service';

describe('DistributionTeamService', () => {
  let service: DistributionTeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributionTeamService],
    }).compile();

    service = module.get<DistributionTeamService>(DistributionTeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
