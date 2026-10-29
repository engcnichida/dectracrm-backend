import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { EmailService } from '../../services/email.service';
import { AlertSubscriberService } from '../auth/alert-subscriber.service';

@Injectable()
export class FinancialAutomationService {
  private readonly logger = new Logger(FinancialAutomationService.name);

  constructor(
    @InjectRepository(Receivable)
    private receivableRepo: Repository<Receivable>,
    @InjectRepository(Payable)
    private payableRepo: Repository<Payable>,
    private emailService: EmailService,
    private alertSubscriberService: AlertSubscriberService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkUpcomingDueDates() {
    this.logger.log('🕒 Verificando contas com vencimento em 3 dias...');

    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    try {
      // ✅ Contas a Receber: Busca o cliente através do contrato
      const upcomingReceivables: any[] = await this.receivableRepo.find({
        where: {
          dueDate: Between(startOfDay, endOfDay),
          status: 'PENDENTE' as any,
        },
        relations: ['contract', 'contract.customer'], // ✅ CORRIGIDO
      });

      for (const rec of upcomingReceivables) {
        const customer = rec.contract?.customer; // ✅ Acessa o cliente via contrato
        if (customer?.email) {
          await this.emailService.sendDueDateReminder(
            customer.email,
            customer.name || 'Cliente',
            rec.amount,
            rec.description || 'Fatura',
            new Date(rec.dueDate).toLocaleDateString('pt-BR'),
            'receber'
          );
        }
      }

      // Contas a Pagar
      const upcomingPayables: any[] = await this.payableRepo.find({
        where: {
          dueDate: Between(startOfDay, endOfDay),
          status: 'PENDENTE' as any,
        },
        relations: ['supplier'], // Mantido (assumindo que Payable tem relação direta com supplier)
      });

      for (const pay of upcomingPayables) {
        if (pay.supplier?.email) {
          await this.emailService.sendDueDateReminder(
            pay.supplier.email,
            pay.supplier.name || 'Fornecedor',
            pay.amount,
            pay.description || 'Conta',
            new Date(pay.dueDate).toLocaleDateString('pt-BR'),
            'pagar'
          );
        }
      }

      this.logger.log(`✅ Verificação concluída. ${upcomingReceivables.length} a receber e ${upcomingPayables.length} a pagar notificadas.`);
    } catch (error: any) {
      this.logger.error(`❌ Erro na automação financeira: ${error.message}`, error.stack);
    }
  }

  // Método manual para TESTE (dispara a verificação imediatamente)
  async runManualTest() {
    this.logger.log('🧪 TESTE MANUAL: Iniciando verificação...');
    await this.checkUpcomingDueDates();
    return { 
      message: 'Teste executado. Verifique os logs e sua caixa de e-mail.',
      timestamp: new Date().toISOString()
    };
  }
}