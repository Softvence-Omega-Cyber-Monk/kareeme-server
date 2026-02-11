import { Module } from '@nestjs/common';
import {
  AdminController,
  TeamController,
  AdminSubmissionController,
} from './controllers';
import {
  DashboardService,
  TeamService,
  AdminSubmissionService,
} from './services';

@Module({
  imports: [],
  controllers: [AdminController, TeamController, AdminSubmissionController],
  providers: [DashboardService, TeamService, AdminSubmissionService],
  exports: [DashboardService, TeamService, AdminSubmissionService],
})
export class AdminModule {}
