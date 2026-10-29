import { Repository } from 'typeorm';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Expense } from '../../domain/expense.entity';
import { Contract } from '../../domain/contract.entity';
import { RecurringExpense } from '../../domain/recurring-expense.entity';
export declare class CashFlowService {
    private forecastRepo;
    private receivableRepo;
    private payableRepo;
    private expenseRepo;
    private contractRepo;
    private recurringExpenseRepo;
    private readonly logger;
    constructor(forecastRepo: Repository<CashFlowForecast>, receivableRepo: Repository<Receivable>, payableRepo: Repository<Payable>, expenseRepo: Repository<Expense>, contractRepo: Repository<Contract>, recurringExpenseRepo: Repository<RecurringExpense>);
    calculateCashFlow(startDate: string, endDate: string): Promise<{
        previousBalance: any;
        totalIn: any;
        totalOut: any;
        finalBalance: number;
        monthlyBreakdown: any[];
        allMovements: any[];
    }>;
    private getPeriodMovements;
    private buildMonthlyBreakdown;
    private generateRecurringForecasts;
    saveForecast(data: any): Promise<CashFlowForecast[]>;
    getForecasts(month?: number, year?: number): Promise<CashFlowForecast[]>;
    importBankStatement(data: {
        transactions: any[];
        startDate: string;
        endDate: string;
    }): Promise<{
        success: boolean;
        created: number;
        skipped: number;
        message: string;
    }>;
    updateReceivable(id: string, data: any): Promise<Receivable>;
    updatePayable(id: string, data: any): Promise<Payable>;
    deleteReceivable(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePayable(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
