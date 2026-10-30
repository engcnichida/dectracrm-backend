import { Repository } from 'typeorm';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Receipt } from '../../domain/receipt.entity';
export declare class FinancialService {
    private receivableRepo;
    private payableRepo;
    private receiptRepo;
    constructor(receivableRepo: Repository<Receivable>, payableRepo: Repository<Payable>, receiptRepo: Repository<Receipt>);
    getDashboard(): Promise<{
        totalReceivables: number;
        totalReceived: number;
        totalCosts: number;
        totalExpenses: number;
        totalOutflows: number;
        balance: number;
        totalPendingReceivables: number;
        totalPendingPayables: number;
    }>;
    getAdvancedFinancialMetrics(): Promise<{
        currentBalance: number;
        overdue: {
            receivables: {
                count: number;
                total: number;
            };
            payables: {
                count: number;
                total: number;
            };
        };
        projection30Days: {
            projectedBalance: number;
            expectedIn: number;
            expectedOut: number;
        };
        pending: {
            receivables: number;
            payables: number;
        };
    }>;
    getMonthlyFinancialData(filters: {
        months?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<any[]>;
}
