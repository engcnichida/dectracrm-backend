import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialController } from './financial.controller';
import { FinancialService } from '../../application/financial/financial.service';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Receipt } from '../../domain/receipt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receivable, Payable, Receipt]),
  ],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
