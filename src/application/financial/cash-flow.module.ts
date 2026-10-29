import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowController } from '../../presentation/financial/cash-flow.controller';
import { CashFlowService } from './cash-flow.service';
import { CategoryController } from '../../presentation/financial/category.controller';
import { CategoryService } from './category.service';

import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Expense } from '../../domain/expense.entity';
import { Contract } from '../../domain/contract.entity';
import { RecurringExpense } from '../../domain/recurring-expense.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { FinancialCategory } from '../../domain/financial-category.entity'; // ✅ Adicione esta linha

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Receivable, 
      Payable, 
      Expense, 
      Contract, 
      RecurringExpense,
      CashFlowForecast,
      FinancialCategory, // ✅ Adicione esta entidade
    ]),
  ],
  controllers: [CashFlowController, CategoryController], // ✅ Adicione o CategoryController
  providers: [CashFlowService, CategoryService], // ✅ Adicione o CategoryService
  exports: [CashFlowService, CategoryService],
})
export class CashFlowModule {}