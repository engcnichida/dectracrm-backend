import { CashFlowService } from '../../application/financial/cash-flow.service';
import { Contract } from '../../domain/contract.entity';
import { Repository } from 'typeorm';
export declare class CashFlowController {
    private readonly cashFlowService;
    private readonly contractRepo;
    private readonly logger;
    constructor(cashFlowService: CashFlowService, contractRepo: Repository<Contract>);
    calculateCashFlow(startDate: string, endDate: string): Promise<{
        previousBalance: any;
        totalIn: any;
        totalOut: any;
        finalBalance: number;
        monthlyBreakdown: any[];
        allMovements: any[];
    }>;
    importBankStatement(data: any): Promise<{
        success: boolean;
        created: number;
        skipped: number;
        message: string;
    }>;
    updateReceivable(id: string, data: any): Promise<import("../../domain/receivable.entity").Receivable>;
    updatePayable(id: string, data: any): Promise<import("../../domain/payable.entity").Payable>;
    getContracts(): Promise<Contract[]>;
    saveForecast(data: any): Promise<import("../../domain/cash-flow-forecast.entity").CashFlowForecast[]>;
    getForecasts(month?: string, year?: string): Promise<import("../../domain/cash-flow-forecast.entity").CashFlowForecast[]>;
    deleteReceivable(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deletePayable(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
