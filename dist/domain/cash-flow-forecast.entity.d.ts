import { Expense } from './expense.entity';
export declare class CashFlowForecast {
    id: string;
    description: string;
    type: string;
    amount: number;
    forecastDate: string;
    month: number;
    year: number;
    isRecurring: boolean;
    expense: Expense;
    expenseId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
