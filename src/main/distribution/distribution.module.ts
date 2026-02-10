import { Module } from '@nestjs/common';
import {
  BackCatalogueController,
  ClientController,
  DistributionController,
  SubmissionController,
} from './controllers';
import {
  BackCatalogueService,
  ClientService,
  DistributionService,
  SubmissionService,
} from './services';

@Module({
  imports: [],
  controllers: [
    DistributionController,
    SubmissionController,
    ClientController,
    BackCatalogueController,
  ],
  providers: [
    DistributionService,
    SubmissionService,
    ClientService,
    BackCatalogueService,
  ],
  exports: [
    DistributionService,
    SubmissionService,
    ClientService,
    BackCatalogueService,
  ],
})
export class DistributionModule {}
