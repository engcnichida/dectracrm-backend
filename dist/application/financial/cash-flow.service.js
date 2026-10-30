"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CashFlowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cash_flow_forecast_entity_1 = require("../../domain/cash-flow-forecast.entity");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const expense_entity_1 = require("../../domain/expense.entity");
const contract_entity_1 = require("../../domain/contract.entity");
const recurring_expense_entity_1 = require("../../domain/recurring-expense.entity");
let CashFlowService = CashFlowService_1 = class CashFlowService {
    constructor(forecastRepo, receivableRepo, payableRepo, expenseRepo, contractRepo, recurringExpenseRepo) {
        this.forecastRepo = forecastRepo;
        this.receivableRepo = receivableRepo;
        this.payableRepo = payableRepo;
        this.expenseRepo = expenseRepo;
        this.contractRepo = contractRepo;
        this.recurringExpenseRepo = recurringExpenseRepo;
        this.logger = new common_1.Logger(CashFlowService_1.name);
    }
    async calculateCashFlow(startDate, endDate) {
        this.logger.log(`📊 Calculando fluxo de caixa de ${startDate} até ${endDate}`);
        const movements = await this.getPeriodMovements(startDate, endDate);
        this.logger.log(`✅ Total de movimentações encontradas no período: ${movements.length}`);
        const startDateObj = new Date(startDate);
        startDateObj.setDate(startDateObj.getDate() - 1);
        const dayBeforeStart = startDateObj.toISOString().split('T')[0];
        const previousMovements = await this.getPeriodMovements('2000-01-01', dayBeforeStart);
        const previousBalance = previousMovements.reduce((acc, mov) => {
            if (mov.movementType === 'RECEITA')
                return acc + mov.amount;
            return acc - mov.amount;
        }, 0);
        this.logger.log(`💰 Saldo anterior (até ${dayBeforeStart}): R$ ${previousBalance.toFixed(2)}`);
        const totalIn = movements
            .filter(m => m.movementType === 'RECEITA')
            .reduce((acc, m) => acc + m.amount, 0);
        const totalOut = movements
            .filter(m => m.movementType === 'DESPESA')
            .reduce((acc, m) => acc + m.amount, 0);
        const finalBalance = previousBalance + totalIn - totalOut;
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
    async getPeriodMovements(startDateStr, endDateStr) {
        const movements = [];
        this.logger.log(`🔍 Buscando movimentações de ${startDateStr} até ${endDateStr}`);
        const receivables = await this.receivableRepo.query(`SELECT * FROM receivables WHERE "dueDate" >= $1 AND "dueDate" <= $2`, [startDateStr, endDateStr]);
        this.logger.log(`📊 Encontradas ${receivables.length} receitas no período`);
        for (const r of receivables) {
            movements.push({
                id: r.id,
                movementType: 'RECEITA',
                transactionType: r.type || 'RECEITA_OPERACIONAL',
                category: r.category || 'Outros',
                description: r.description || 'Receita',
                amount: Number(r.amount),
                date: r.dueDate,
                status: r.status || 'PENDENTE',
                source: 'receivable'
            });
        }
        const payables = await this.payableRepo.query(`SELECT * FROM payables WHERE "dueDate" >= $1 AND "dueDate" <= $2`, [startDateStr, endDateStr]);
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
        const expenses = await this.expenseRepo.find({
            where: { expenseDate: (0, typeorm_2.Between)(startDateStr, endDateStr) }
        });
        this.logger.log(`📊 Encontradas ${expenses.length} despesas (expenses) no período`);
        const expenseTypesResult = await this.expenseRepo.manager.query('SELECT id, name FROM expense_types');
        const typeMap = new Map();
        expenseTypesResult.forEach((t) => typeMap.set(t.id, t.name));
        this.logger.log(`📋 Tipos de despesa carregados: ${expenseTypesResult.length}`);
        for (const e of expenses) {
            const hasPayable = payables.some((p) => p.expenseId === e.id);
            if (!hasPayable) {
                const expenseTypeId = e.expenseTypeId;
                const categoryName = typeMap.get(expenseTypeId) || e.category || 'Outros';
                movements.push({
                    id: e.id,
                    movementType: 'DESPESA',
                    transactionType: e.type || 'DESPESA_OPERACIONAL',
                    category: categoryName,
                    expenseTypeId: expenseTypeId,
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
    buildMonthlyBreakdown(startDate, endDate, movements, previousBalance) {
        const breakdown = [];
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
    async generateRecurringForecasts(recurringExpenses, start, end) {
        const forecasts = [];
        for (const recExp of recurringExpenses) {
            const dueDay = recExp.dueDay || 10;
            let currentDate = new Date(start);
            while (currentDate <= end) {
                const forecastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dueDay);
                if (forecastDate >= start && forecastDate <= end) {
                    forecasts.push({
                        id: `rec-${recExp.id}-${forecastDate.getTime()}`,
                        type: 'DESPESA',
                        description: `${recExp.description} (Recorrente)`,
                        amount: Number(recExp.estimatedAmount || 0),
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
    async saveForecast(data) {
        const forecast = this.forecastRepo.create(data);
        return this.forecastRepo.save(forecast);
    }
    async getForecasts(month, year) {
        const query = this.forecastRepo.createQueryBuilder('f');
        if (month && year)
            query.where('f.month = :month AND f.year = :year', { month, year });
        return query.orderBy('f.forecastDate', 'ASC').getMany();
    }
    async importBankStatement(data) {
        const { transactions } = data;
        if (!transactions || transactions.length === 0) {
            throw new Error('Nenhuma transação válida para importar');
        }
        this.logger.log(`📥 [importBankStatement] Iniciando importação de ${transactions.length} transações...`);
        let createdCount = 0;
        let skippedCount = 0;
        const skippedDetails = [];
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
                        status: 'RECEBIDO',
                        isInitialBalance: false,
                    });
                    await this.receivableRepo.save(receivable);
                    createdCount++;
                    this.logger.log(`✅ Receita importada: ${trans.description} - R$ ${trans.amount} em ${trans.date}`);
                }
                else if (trans.type === 'EXPENSE') {
                    const payable = this.payableRepo.create({
                        description: trans.description,
                        amount: Math.abs(trans.amount),
                        dueDate: trans.date,
                        paidAt: trans.date,
                        status: 'PAGO',
                    });
                    await this.payableRepo.save(payable);
                    createdCount++;
                    this.logger.log(`✅ Despesa importada: ${trans.description} - R$ ${trans.amount} em ${trans.date}`);
                }
            }
            catch (error) {
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
    async updateReceivable(id, data) {
        this.logger.log(`✏️ [updateReceivable] Atualizando receita: ${id}`);
        const receivable = await this.receivableRepo.findOne({ where: { id } });
        if (!receivable) {
            throw new Error('Receita não encontrada');
        }
        if (data.description !== undefined)
            receivable.description = data.description;
        if (data.amount !== undefined)
            receivable.amount = data.amount;
        if (data.dueDate !== undefined)
            receivable.dueDate = data.dueDate;
        if (data.paidAt !== undefined)
            receivable.paidAt = data.paidAt;
        if (data.status !== undefined)
            receivable.status = data.status;
        if (data.contractId !== undefined)
            receivable.contractId = data.contractId;
        if (data.category !== undefined)
            receivable.category = data.category;
        if (data.type !== undefined)
            receivable.type = data.type;
        await this.receivableRepo.save(receivable);
        this.logger.log(`✅ Receita atualizada com sucesso: ${id}`);
        return receivable;
    }
    async updatePayable(id, data) {
        this.logger.log(`✏️ [updatePayable] Atualizando despesa: ${id}`);
        const payable = await this.payableRepo.findOne({ where: { id } });
        if (!payable) {
            throw new Error('Despesa não encontrada');
        }
        if (data.description !== undefined)
            payable.description = data.description;
        if (data.amount !== undefined)
            payable.amount = data.amount;
        if (data.dueDate !== undefined)
            payable.dueDate = data.dueDate;
        if (data.paidAt !== undefined)
            payable.paidAt = data.paidAt;
        if (data.status !== undefined)
            payable.status = data.status;
        if (data.contractId !== undefined)
            payable.contractId = data.contractId;
        if (data.category !== undefined)
            payable.category = data.category;
        if (data.type !== undefined)
            payable.type = data.type;
        await this.payableRepo.save(payable);
        this.logger.log(`✅ Despesa atualizada com sucesso: ${id}`);
        return payable;
    }
    async deleteReceivable(id) {
        this.logger.log(`🗑️ [deleteReceivable] Removendo receita: ${id}`);
        const result = await this.receivableRepo.delete(id);
        if (result.affected === 0) {
            throw new Error('Receita não encontrada');
        }
        return { success: true, message: 'Receita removida com sucesso' };
    }
    async deletePayable(id) {
        this.logger.log(`🗑️ [deletePayable] Removendo despesa: ${id}`);
        const result = await this.payableRepo.delete(id);
        if (result.affected === 0) {
            throw new Error('Despesa não encontrada');
        }
        return { success: true, message: 'Despesa removida com sucesso' };
    }
};
exports.CashFlowService = CashFlowService;
exports.CashFlowService = CashFlowService = CashFlowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cash_flow_forecast_entity_1.CashFlowForecast)),
    __param(1, (0, typeorm_1.InjectRepository)(receivable_entity_1.Receivable)),
    __param(2, (0, typeorm_1.InjectRepository)(payable_entity_1.Payable)),
    __param(3, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __param(4, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __param(5, (0, typeorm_1.InjectRepository)(recurring_expense_entity_1.RecurringExpense)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CashFlowService);
//# sourceMappingURL=cash-flow.service.js.map