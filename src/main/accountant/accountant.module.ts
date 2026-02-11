import { Module } from '@nestjs/common';
import { AccountantController } from './controllers/accountant.controller';
import {
  AccountantDashboardService,
  AccountantSettingsService,
  ClientFinancialService,
  StatementService,
} from './services';

@Module({
  imports: [],
  controllers: [AccountantController],
  providers: [
    AccountantDashboardService,
    AccountantSettingsService,
    ClientFinancialService,
    StatementService,
  ],
  exports: [
    AccountantDashboardService,
    AccountantSettingsService,
    ClientFinancialService,
    StatementService,
  ],
})
export class AccountantModule {}
