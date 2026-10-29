import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class RecurringExpenseAutomationService {
  constructor(private readonly crmService: CrmService) {}

  // Roda todos os dias às 08:00 da manhã
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCron() {
    console.log('⏰ [RecurringExpenseAutomation] Executando geração automática de contas a pagar...');
    try {
      const result = await this.crmService.generateRecurringPayables();
      console.log(`✅ [RecurringExpenseAutomation] ${result.generated} contas a pagar geradas`);
    } catch (error) {
      console.error('❌ [RecurringExpenseAutomation] Erro ao gerar contas a pagar:', error);
    }
  }
}