import { FinancialService } from '../../application/financial/financial.service';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
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
    getAdvancedMetrics(): Promise<{
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
    getMonthlyFinancial(months?: string, startDate?: string, endDate?: string): Promise<any[]>;
}
