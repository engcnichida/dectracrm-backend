export declare class RecurringExpense {
    id: string;
    description: string;
    category: string;
    estimatedAmount: number;
    dueDay: number;
    status: string;
    notes: string;
    lastGenerated: string;
    createdAt: Date;
    generatesReceipt: boolean;
    autoConfirmOnDueDate: boolean;
    updatedAt: Date;
}
