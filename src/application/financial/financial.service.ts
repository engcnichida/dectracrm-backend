import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Receipt } from '../../domain/receipt.entity';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(Receivable)
    private receivableRepo: Repository<Receivable>,
    @InjectRepository(Payable)
    private payableRepo: Repository<Payable>,
    @InjectRepository(Receipt)
    private receiptRepo: Repository<Receipt>,
  ) {}

  async getDashboard() {
    const totalReceivables = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status = :status', { status: 'RECEBIDO' })
      .getRawOne();

    const totalPayables = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: 'PAGO' })
      .getRawOne();

    const pendingReceivables = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status != :status', { status: 'RECEBIDO' })
      .getRawOne();

    const pendingPayables = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status != :status', { status: 'PAGO' })
      .getRawOne();

    const totalReceived = Number(totalReceivables?.total || 0);
    const totalPaid = Number(totalPayables?.total || 0);

    return {
      totalReceivables: totalReceived,
      totalReceived,
      totalCosts: 0, // Ajuste conforme sua lógica de custos
      totalExpenses: totalPaid,
      totalOutflows: totalPaid,
      balance: totalReceived - totalPaid,
      totalPendingReceivables: Number(pendingReceivables?.total || 0),
      totalPendingPayables: Number(pendingPayables?.total || 0),
    };
  }

  async getAdvancedFinancialMetrics() {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Saldo atual
    const receivedTotal = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.status = :status', { status: 'RECEBIDO' })
      .getRawOne();

    const paidTotal = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.status = :status', { status: 'PAGO' })
      .getRawOne();

    const currentBalance = Number(receivedTotal?.total || 0) - Number(paidTotal?.total || 0);

    // Inadimplência
    const overdueReceivables = await this.receivableRepo
      .createQueryBuilder('r')
      .select('COUNT(r.id)', 'count')
      .addSelect('SUM(r.amount)', 'total')
      .where('r.dueDate < :today', { today })
      .andWhere('r.status != :status', { status: 'RECEBIDO' })
      .getRawOne();

    const overduePayables = await this.payableRepo
      .createQueryBuilder('p')
      .select('COUNT(p.id)', 'count')
      .addSelect('SUM(p.amount)', 'total')
      .where('p.dueDate < :today', { today })
      .andWhere('p.status != :status', { status: 'PAGO' })
      .getRawOne();

    // Projeção 30 dias
    const projectedIn = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.dueDate BETWEEN :start AND :end', { start: today, end: thirtyDaysFromNow })
      .andWhere('r.status != :status', { status: 'RECEBIDO' })
      .getRawOne();

    const projectedOut = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.dueDate BETWEEN :start AND :end', { start: today, end: thirtyDaysFromNow })
      .andWhere('p.status != :status', { status: 'PAGO' })
      .getRawOne();

    const projectedBalance = currentBalance 
      + Number(projectedIn?.total || 0) 
      - Number(projectedOut?.total || 0);

    // Pendentes futuros
    const pendingReceivables = await this.receivableRepo
      .createQueryBuilder('r')
      .select('SUM(r.amount)', 'total')
      .where('r.dueDate >= :today', { today })
      .andWhere('r.status != :status', { status: 'RECEBIDO' })
      .getRawOne();

    const pendingPayables = await this.payableRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.dueDate >= :today', { today })
      .andWhere('p.status != :status', { status: 'PAGO' })
      .getRawOne();

    return {
      currentBalance,
      overdue: {
        receivables: {
          count: Number(overdueReceivables?.count || 0),
          total: Number(overdueReceivables?.total || 0),
        },
        payables: {
          count: Number(overduePayables?.count || 0),
          total: Number(overduePayables?.total || 0),
        },
      },
      projection30Days: {
        projectedBalance,
        expectedIn: Number(projectedIn?.total || 0),
        expectedOut: Number(projectedOut?.total || 0),
      },
      pending: {
        receivables: Number(pendingReceivables?.total || 0),
        payables: Number(pendingPayables?.total || 0),
      },
    };
  }

  async getMonthlyFinancialData(filters: { months?: number; startDate?: string; endDate?: string }) {
    // Implementação básica - ajuste conforme sua necessidade
    return [];
  }
}