import { Test, TestingModule } from '@nestjs/testing';
import { DistributionTeamController } from './distribution-team.controller';
import { DistributionTeamService } from './distribution-team.service';

describe('DistributionTeamController', () => {
  let controller: DistributionTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributionTeamController],
      providers: [DistributionTeamService],
    }).compile();

    controller = module.get<DistributionTeamController>(DistributionTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
