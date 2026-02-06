import { Module } from '@nestjs/common';
import {
  PaymentRequestController,
  ProfitLossController,
  TransactionController,
} from './controllers/accounting.controller';
import { StatementController } from './controllers/statement.controller';
import {
  PaymentRequestService,
  ProfitLossService,
} from './services/profit-loss.service';
import { StatementService } from './services/statement.service';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [],
  controllers: [
    StatementController,
    TransactionController,
    ProfitLossController,
    PaymentRequestController,
  ],
  providers: [
    StatementService,
    TransactionService,
    ProfitLossService,
    PaymentRequestService,
  ],
  exports: [
    StatementService,
    TransactionService,
    ProfitLossService,
    PaymentRequestService,
  ],
})
export class AccountingModule {}
