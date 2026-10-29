import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ReceiptsModule } from '../receipts/receipts.module';
import { CrmController } from '../../presentation/crm/crm.controller';
import { CrmService } from './crm.service';
import { AlertSubscriberService } from '../auth/alert-subscriber.service';
import { EmailService } from '../../services/email.service';
import { FinancialAutomationService } from '../financial/financial-automation.service';
import { RecurringExpenseAutomationService } from '../financial/recurring-expense-automation.service';
import { UserPreset } from '../../domain/user-preset.entity';

// Entidades
import { Customer } from '../../domain/customer.entity';
import { Opportunity } from '../../domain/opportunity.entity';
import { Contract } from '../../domain/contract.entity';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { PayableCategory } from '../../domain/payable-category.entity';
import { Supplier } from '../../domain/supplier.entity';
import { User } from '../../domain/user.entity';
import { AlertSubscriber } from '../../domain/alert-subscriber.entity';
import { Expense } from '../../domain/expense.entity';
import { ExpenseType } from '../../domain/expense-type.entity';
import { RecurringExpense } from '../../domain/recurring-expense.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Opportunity,
      Contract,
      Receivable,
      Payable,
      PayableCategory,
      Supplier,
      User,
      AlertSubscriber,
      Expense,
      ExpenseType,
      RecurringExpense,
      CashFlowForecast,
      UserPreset,
    ]),
    ReceiptsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dectra-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CrmController],
  providers: [
    CrmService,
    AlertSubscriberService,
    EmailService,
    FinancialAutomationService,
    RecurringExpenseAutomationService,
  ],
  exports: [CrmService],
})
export class CrmModule {}