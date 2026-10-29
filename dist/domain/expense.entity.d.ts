import { ExpenseType } from './expense-type.entity';
export declare class Expense {
    id: string;
    description: string;
    expenseType: ExpenseType;
    expenseTypeId: string;
    amount: number;
    expenseDate: string;
    dueDate: string;
    status: string;
    notes: string;
    isRecurring: boolean;
    recurrencePeriod: string;
    recurrenceCount: number;
    recurrenceEndDate: string;
    createdAt: Date;
    generatesReceipt: boolean;
    autoConfirmOnDueDate: boolean;
    updatedAt: Date;
}
