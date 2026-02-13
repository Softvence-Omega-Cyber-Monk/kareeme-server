import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { BackCatalogueController } from './controllers/back-catalogue.controller';
import { ClientController } from './controllers/client.controller';
import { DistributionSubmissionController } from './controllers/distribution-submission.controller';
import { DistributionController } from './controllers/distribution.controller';
import { SubmissionController } from './controllers/submission.controller';
import { BackCatalogueService } from './services/back-catalogue.service';
import { ClientService } from './services/client.service';
import { DistributionSubmissionService } from './services/distribution-submission.service';
import { DistributionService } from './services/distribution.service';
import { SubmissionService } from './services/submission.service';

@Module({
  imports: [],
  controllers: [
    DistributionSubmissionController,
    BackCatalogueController,
    ClientController,
    DistributionController,
    SubmissionController,
  ],
  providers: [
    PrismaService,
    DistributionSubmissionService,
    BackCatalogueService,
    ClientService,
    DistributionService,
    SubmissionService,
  ],
  exports: [
    DistributionSubmissionService,
    BackCatalogueService,
    ClientService,
    DistributionService,
    SubmissionService,
  ],
})
export class DistributionModule {}
