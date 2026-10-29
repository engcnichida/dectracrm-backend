import { RecurringExpense } from './recurring-expense.entity';
import { Expense } from './expense.entity';
import { Contract } from './contract.entity';
export declare enum PayableStatus {
    PENDENTE = "PENDENTE",
    PAGO = "PAGO",
    CANCELADO = "CANCELADO",
    ATRASADO = "ATRASADO"
}
export declare class Payable {
    id: string;
    description: string;
    category: string;
    amount: number;
    dueDate: Date;
    paidAt: Date;
    status: PayableStatus;
    paymentMethod: string;
    notes: string;
    contractId: string;
    recurringExpenseId: string;
    recurringExpense: RecurringExpense;
    expenseId: string;
    expense: Expense;
    generatesReceipt: boolean;
    createdAt: Date;
    contract: Contract;
    type: string;
    updatedAt: Date;
}
