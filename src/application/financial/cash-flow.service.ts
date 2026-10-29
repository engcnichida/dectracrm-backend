import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Expense } from '../../domain/expense.entity';
import { Contract } from '../../domain/contract.entity';
import { RecurringExpense } from '../../domain/recurring-expense.entity';

@Injectable()
export class CashFlowService {
  private readonly logger = new Logger(CashFlowService.name);

  constructor(
    @InjectRepository(CashFlowForecast)
    private forecastRepo: Repository<CashFlowForecast>,
    @InjectRepository(Receivable)
    private receivableRepo: Repository<Receivable>,
    @InjectRepository(Payable)
    private payableRepo: Repository<Payable>,
    @InjectRepository(Expense)
    private expenseRepo: Repository<Expense>,
    @InjectRepository(Contract)
    private contractRepo: Repository<Contract>,
    @InjectRepository(RecurringExpense)
    private recurringExpenseRepo: Repository<RecurringExpense>,
  ) {}

  async calculateCashFlow(startDate: string, endDate: string) {
    this.logger.log(`📊 Calculando fluxo de caixa de ${startDate} até ${endDate}`);

    // 1. Buscar todas as movimentações no período
    const movements = await this.getPeriodMovements(startDate, endDate);
    this.logger.log(`✅ Total de movimentações encontradas no período: ${movements.length}`);

    // 2. Calcular saldo anterior (todas as transações ANTES da data inicial)
    const startDateObj = new Date(startDate);
    startDateObj.setDate(startDateObj.getDate() - 1);
    const dayBeforeStart = startDateObj.toISOString().split('T')[0];
    
    const previousMovements = await this.getPeriodMovements('2000-01-01', dayBeforeStart);
    const previousBalance = previousMovements.reduce((acc, mov) => {
      if (mov.movementType === 'RECEITA') return acc + mov.amount;
      return acc - mov.amount;
    }, 0);

    this.logger.log(`💰 Saldo anterior (até ${dayBeforeStart}): R$ ${previousBalance.toFixed(2)}`);

    // 3. Calcular totais do período
    const totalIn = movements
      .filter(m => m.movementType === 'RECEITA')
      .reduce((acc, m) => acc + m.amount, 0);
    
    const totalOut = movements
      .filter(m => m.movementType === 'DESPESA')
      .reduce((acc, m) => acc + m.amount, 0);

    const finalBalance = previousBalance + totalIn - totalOut;

    // 4. Montar breakdown mensal
    const monthlyBreakdown = this.buildMonthlyBreakdown(startDate, endDate, movements, previousBalance);

    return {
      previousBalance,
      totalIn,
      totalOut,
      finalBalance,
      monthlyBreakdown,
      allMovements: movements,
    };
  }

  private async getPeriodMovements(startDateStr: string, endDateStr: string) {
    const movements: any[] = [];

    this.logger.log(`🔍 Buscando movimentações de ${startDateStr} até ${endDateStr}`);

    // ==========================================
    // 1. RECEITAS (Receivables)
    // ==========================================
    const receivables = await this.receivableRepo.query(
      `SELECT * FROM receivables WHERE "dueDate" >= $1 AND "dueDate" <= $2`,
      [startDateStr, endDateStr]
    );
    this.logger.log(`📊 Encontradas ${receivables.length} receitas no período`);

    for (const r of receivables) {
      movements.push({
        id: r.id, // ✅ Corrigido: era 'e.id'
        movementType: 'RECEITA', // ✅ Corrigido: era 'DESPESA'
        transactionType: (r as any).type || 'RECEITA_OPERACIONAL',
        category: (r as any).category || 'Outros',
        description: r.description || 'Receita',
        amount: Number(r.amount),
        date: r.dueDate,
        status: r.status || 'PENDENTE',
        source: 'receivable'
      });
    } // ✅ Corrigido: Faltava esta chave de fechamento do loop!

    // ==========================================
    // 2. CONTAS A PAGAR (Payables)
    // ==========================================
    const payables = await this.payableRepo.query(
      `SELECT * FROM payables WHERE "dueDate" >= $1 AND "dueDate" <= $2`,
      [startDateStr, endDateStr]
    );
    this.logger.log(`📊 Encontradas ${payables.length} despesas (payables) no período`);

    for (const p of payables) {
      movements.push({
        id: p.id,
        movementType: 'DESPESA',
        transactionType: p.type,
        category: p.category,
        contractId: p.contractId,
        description: p.description || 'Conta a Pagar',
        amount: Number(p.amount),
        date: p.dueDate,
        status: p.status,
        source: 'payable'
      });
    }

    // ==========================================
    // 3. DESPESAS OPERACIONAIS (Expenses)
    // ==========================================
    const expenses = await this.expenseRepo.find({
      where: { expenseDate: Between(startDateStr, endDateStr) }
    });
    this.logger.log(`📊 Encontradas ${expenses.length} despesas (expenses) no período`);

    const expenseTypesResult = await this.expenseRepo.manager.query(
      'SELECT id, name FROM expense_types'
    );
    
    const typeMap = new Map<string, string>();
    expenseTypesResult.forEach((t: any) => typeMap.set(t.id, t.name));
    this.logger.log(`📋 Tipos de despesa carregados: ${expenseTypesResult.length}`);

    for (const e of expenses) {
      const hasPayable = payables.some((p: any) => p.expenseId === e.id);
      if (!hasPayable) {
        const expenseTypeId = (e as any).expenseTypeId;
        const categoryName = typeMap.get(expenseTypeId) || (e as any).category || 'Outros';

        movements.push({
          id: e.id,
          movementType: 'DESPESA',
          transactionType: (e as any).type || 'DESPESA_OPERACIONAL',
          category: categoryName,
          expenseTypeId: expenseTypeId, // ✅ Adicionado para manter consistência
          description: e.description || 'Despesa',
          amount: Number(e.amount),
          date: e.expenseDate,
          status: e.status || 'PAGO',
          source: 'expense'
        });
      }
    }

    this.logger.log(`✅ Total de movimentações processadas: ${movements.length}`);
    return movements;
  }

  private buildMonthlyBreakdown(
    startDate: string,
    endDate: string,
    movements: any[],
    previousBalance: number
  ) {
    const breakdown: any[] = [];
    
    const [startYear, startMonth] = startDate.split('-').map(Number);
    const [endYear, endMonth] = endDate.split('-').map(Number);
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    let runningBalance = previousBalance;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthMovements = movements.filter(m => {
        const movDate = new Date(m.date);
        return movDate.getFullYear() === currentYear && movDate.getMonth() + 1 === currentMonth;
      });

      const monthIn = monthMovements
        .filter(m => m.movementType === 'RECEITA')
        .reduce((acc, m) => acc + m.amount, 0);
      
      const monthOut = monthMovements
        .filter(m => m.movementType === 'DESPESA')
        .reduce((acc, m) => acc + m.amount, 0);

      const monthBalance = monthIn - monthOut;
      const startingBalance = runningBalance;
      runningBalance += monthBalance;

      breakdown.push({
        year: currentYear,
        month: currentMonth,
        monthName: monthNames[currentMonth - 1],
        startingBalance,
        totalIn: monthIn,
        totalOut: monthOut,
        balance: monthBalance,
        endingBalance: runningBalance,
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return breakdown;
  }

  private async generateRecurringForecasts(recurringExpenses: RecurringExpense[], start: Date, end: Date) {
    const forecasts: any[] = [];
    for (const recExp of recurringExpenses) {
      const dueDay = (recExp as any).dueDay || 10;
      let currentDate = new Date(start);
      while (currentDate <= end) {
        const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dueDay);
        if (forecastDate >= start && forecastDate <= end) {
          forecasts.push({
            id: `rec-${recExp.id}-${forecastDate.getTime()}`,
            type: 'DESPESA',
            description: `${recExp.description} (Recorrente)`,
            amount: Number((recExp as any).estimatedAmount || 0),
            date: forecastDate,
            status: 'PREVISTO',
            source: 'recurring',
            recurringExpenseId: recExp.id,
          });
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    return forecasts;
  }

  async saveForecast(data: any) {
    const forecast = this.forecastRepo.create(data);
    return this.forecastRepo.save(forecast);
  }

  async getForecasts(month?: number, year?: number) {
    const query = this.forecastRepo.createQueryBuilder('f');
    if (month && year) query.where('f.month = :month AND f.year = :year', { month, year });
    return query.orderBy('f.forecastDate', 'ASC').getMany();
  }

  // ==========================================
  // IMPORTAÇÃO DE EXTRATO BANCÁRIO
  // ==========================================

  async importBankStatement(data: { transactions: any[]; startDate: string; endDate: string }) {
    const { transactions } = data;
    
    if (!transactions || transactions.length === 0) {
      throw new Error('Nenhuma transação válida para importar');
    }

    this.logger.log(`📥 [importBankStatement] Iniciando importação de ${transactions.length} transações...`);

    let createdCount = 0;
    let skippedCount = 0;
    const skippedDetails: string[] = [];

    for (const trans of transactions) {
      try {
        if (!trans.date || !trans.description || !trans.amount) {
          this.logger.warn(`⚠️ Transação ignorada (dados incompletos): ${JSON.stringify(trans)}`);
          skippedCount++;
          continue;
        }

        const existingReceivable = await this.receivableRepo.findOne({
          where: { 
            dueDate: trans.date, 
            amount: Math.abs(trans.amount),
            description: trans.description
          },
        });
        
        const existingPayable = await this.payableRepo.findOne({
          where: { 
            dueDate: trans.date, 
            amount: Math.abs(trans.amount),
            description: trans.description
          },
        });

        if (existingReceivable || existingPayable) {
          skippedCount++;
          skippedDetails.push(`${trans.type}: ${trans.description} (${trans.date} - R$ ${trans.amount})`);
          this.logger.warn(`⏭️ Duplicata real ignorada: ${trans.description} - ${trans.date}`);
          continue;
        }

        if (trans.type === 'INCOME') {
          const receivable = this.receivableRepo.create({
            description: trans.description,
            amount: Math.abs(trans.amount),
            dueDate: trans.date,
            paidAt: trans.date,
            status: 'RECEBIDO' as any,
            isInitialBalance: false,
          } as any);
          
          await this.receivableRepo.save(receivable);
          createdCount++;
          this.logger.log(`✅ Receita importada: ${trans.description} - R$ ${trans.amount} em ${trans.date}`);
        } else if (trans.type === 'EXPENSE') {
          const payable = this.payableRepo.create({
            description: trans.description,
            amount: Math.abs(trans.amount),
            dueDate: trans.date,
            paidAt: trans.date,
            status: 'PAGO' as any,
          } as any);
          
          await this.payableRepo.save(payable);
          createdCount++;
          this.logger.log(`✅ Despesa importada: ${trans.description} - R$ ${trans.amount} em ${trans.date}`);
        }
      } catch (error: any) {
        this.logger.error(`❌ Erro ao importar transação "${trans.description}": ${error.message}`, error.stack);
      }
    }

    this.logger.log(`✅ [importBankStatement] Importação concluída!`);
    this.logger.log(`📊 Criadas: ${createdCount}, Ignoradas: ${skippedCount}`);
    
    if (skippedDetails.length > 0) {
      this.logger.log(`📋 Transações ignoradas (primeiras 10):`);
      skippedDetails.slice(0, 10).forEach(detail => this.logger.log(`   - ${detail}`));
    }

    return {
      success: true,
      created: createdCount,
      skipped: skippedCount,
      message: `${createdCount} transações importadas com sucesso! ${skippedCount > 0 ? `${skippedCount} duplicadas ignoradas.` : ''}`,
    };
  }

  // ==========================================
  // EDIÇÃO DE RECEITAS E DESPESAS
  // ==========================================

  async updateReceivable(id: string, data: any) {
    this.logger.log(`✏️ [updateReceivable] Atualizando receita: ${id}`);

    const receivable = await this.receivableRepo.findOne({ where: { id } });
    if (!receivable) {
      throw new Error('Receita não encontrada');
    }

    if (data.description !== undefined) receivable.description = data.description;
    if (data.amount !== undefined) receivable.amount = data.amount;
    if (data.dueDate !== undefined) receivable.dueDate = data.dueDate;
    if (data.paidAt !== undefined) receivable.paidAt = data.paidAt;
    if (data.status !== undefined) receivable.status = data.status;
    if (data.contractId !== undefined) receivable.contractId = data.contractId;
    if (data.category !== undefined) receivable.category = data.category;
    if (data.type !== undefined) receivable.type = data.type;

    await this.receivableRepo.save(receivable);
    this.logger.log(`✅ Receita atualizada com sucesso: ${id}`);
    
    return receivable;
  }

  async updatePayable(id: string, data: any) {
    this.logger.log(`✏️ [updatePayable] Atualizando despesa: ${id}`);

    const payable = await this.payableRepo.findOne({ where: { id } });
    if (!payable) {
      throw new Error('Despesa não encontrada');
    }

    if (data.description !== undefined) payable.description = data.description;
    if (data.amount !== undefined) payable.amount = data.amount;
    if (data.dueDate !== undefined) payable.dueDate = data.dueDate;
    if (data.paidAt !== undefined) payable.paidAt = data.paidAt;
    if (data.status !== undefined) payable.status = data.status;
    if (data.contractId !== undefined) payable.contractId = data.contractId;
    if (data.category !== undefined) payable.category = data.category;
    if (data.type !== undefined) payable.type = data.type;

    await this.payableRepo.save(payable);
    this.logger.log(`✅ Despesa atualizada com sucesso: ${id}`);
    
    return payable;
  }
  // ==========================================
  // EXCLUSÃO DE RECEITAS E DESPESAS
  // ==========================================

  async deleteReceivable(id: string) {
    this.logger.log(`🗑️ [deleteReceivable] Removendo receita: ${id}`);
    const result = await this.receivableRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Receita não encontrada');
    }
    return { success: true, message: 'Receita removida com sucesso' };
  }

  async deletePayable(id: string) {
    this.logger.log(`🗑️ [deletePayable] Removendo despesa: ${id}`);
    const result = await this.payableRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Despesa não encontrada');
    }
    return { success: true, message: 'Despesa removida com sucesso' };
  }
}