import { FinancialAutomationService } from '../../application/financial/financial-automation.service';
import { JwtService } from '@nestjs/jwt';
import { CrmService } from '../../application/crm/crm.service';
import { AlertSubscriberService } from '../../application/auth/alert-subscriber.service';
import { ExpenseType } from '../../domain/expense-type.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { Response } from 'express';
export declare class CrmController {
    private readonly crmService;
    private readonly jwtService;
    private readonly alertSubscriberService;
    private readonly financialAutomationService;
    constructor(crmService: CrmService, jwtService: JwtService, alertSubscriberService: AlertSubscriberService, financialAutomationService: FinancialAutomationService);
    getBoard(): Promise<Record<string, any[]>>;
    createOpportunity(data: any): Promise<any>;
    updateOpportunity(id: string, data: any): Promise<import("../../domain/opportunity.entity").Opportunity>;
    updateStage(id: string, stage: string): Promise<{
        opportunity: any;
        action: string;
        message: string;
    }>;
    deleteOpportunity(id: string): Promise<{
        success: boolean;
    }>;
    findAllCustomers(): Promise<import("../../domain/customer.entity").Customer[]>;
    getCustomerMetrics(): Promise<{
        totalCustomers: number;
        activeCustomers: number;
    }>;
    getCustomerDetails(id: string): Promise<{
        contracts: import("../../domain/contract.entity").Contract[];
        opportunities: import("../../domain/opportunity.entity").Opportunity[];
        id: string;
        name: string;
        companyName: string;
        cnpj: string;
        cpf: string;
        address: string;
        city: string;
        state: string;
        cep: string;
        contactName: string;
        contactPhone: string;
        contactEmail: string;
        status: import("../../domain/customer.entity").CustomerStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCustomer(data: any): Promise<any>;
    updateCustomer(id: string, data: any): Promise<import("../../domain/customer.entity").Customer>;
    deleteCustomer(id: string): Promise<{
        success: boolean;
    }>;
    getCustomerWithContracts(id: string): Promise<{
        customer: import("../../domain/customer.entity").Customer;
        contracts: any[];
    }>;
    findAllContracts(): Promise<import("../../domain/contract.entity").Contract[]>;
    createContract(data: any): Promise<any>;
    updateContract(id: string, data: any): Promise<any>;
    deleteContract(id: string): Promise<{
        message: string;
    }>;
    archiveOpportunity(id: string, body: {
        reason?: string;
    }): Promise<import("../../domain/opportunity.entity").Opportunity>;
    getArchivedOpportunities(customerId?: string): Promise<import("../../domain/opportunity.entity").Opportunity[]>;
    findAllReceivables(): Promise<import("../../domain/receivable.entity").Receivable[]>;
    markReceivableAsPaid(id: string, paidAt?: string): Promise<import("../../domain/receivable.entity").Receivable>;
    markReceivableAsOpen(id: string): Promise<import("../../domain/receivable.entity").Receivable>;
    updateReceivable(id: string, data: any): Promise<import("../../domain/receivable.entity").Receivable>;
    deleteReceivable(id: string): Promise<{
        success: boolean;
    }>;
    findAllPayables(): Promise<import("../../domain/payable.entity").Payable[]>;
    createPayable(data: any): Promise<import("../../domain/payable.entity").Payable[]>;
    markPayableAsPaid(id: string, data: any): Promise<any>;
    updatePayable(id: string, data: any): Promise<import("../../domain/payable.entity").Payable>;
    deletePayable(id: string): Promise<{
        success: boolean;
    }>;
    getFinancialDashboard(): Promise<{
        totalReceivables: number;
        totalCosts: number;
        totalExpenses: number;
        totalOutflows: number;
        balance: number;
        totalPendingReceivables: number;
        totalPendingPayables: number;
    }>;
    getContractsPendingReceivables(): Promise<import("../../domain/receivable.entity").Receivable[]>;
    markContractReceivablesAsOverdue(id: string): Promise<{
        message: string;
    }>;
    getSalesKPIs(): Promise<{
        totalOpportunities: number;
        wonOpportunities: number;
        lostOpportunities: number;
        conversionRate: number;
        averageTicket: number;
        pipelineTotal: number;
        newCustomers: number;
        cac: number;
        totalContractValue: number;
        totalContracts: number;
    }>;
    getMonthlyFinancialData(months?: string, startDate?: string, endDate?: string): Promise<{
        month: string;
        monthShort: string;
        year: number;
        monthNumber: number;
        receivables: number;
        costs: number;
        expenses: number;
    }[]>;
    exportOpportunitiesCsv(res: Response): Promise<Response<any, Record<string, any>>>;
    markAsPaid(type: 'receivable' | 'payable', id: string): Promise<any>;
    getAlertSubscribers(req: any): Promise<import("../../domain/alert-subscriber.entity").AlertSubscriber[]>;
    addAlertSubscriber(req: any, data: {
        userId: string;
        receivePaymentConfirmations: boolean;
        receiveDueDateReminders: boolean;
    }): Promise<import("../../domain/alert-subscriber.entity").AlertSubscriber>;
    removeAlertSubscriber(req: any, id: string): Promise<{
        message: string;
    }>;
    testEmailAutomation(): Promise<{
        message: string;
        timestamp: string;
    }>;
    findAllExpenses(): Promise<import("../../domain/expense.entity").Expense[]>;
    createExpense(data: any): Promise<any>;
    updateExpense(id: string, data: any): Promise<import("../../domain/expense.entity").Expense>;
    deleteExpense(id: string): Promise<{
        success: boolean;
    }>;
    getExpensesByCategory(): Promise<any[]>;
    getTotalExpenses(startDate?: string, endDate?: string): Promise<number>;
    findAllRecurringExpenses(): Promise<import("../../domain/recurring-expense.entity").RecurringExpense[]>;
    createRecurringExpense(data: any): Promise<any>;
    updateRecurringExpense(id: string, data: any): Promise<import("../../domain/recurring-expense.entity").RecurringExpense>;
    deleteRecurringExpense(id: string): Promise<{
        success: boolean;
    }>;
    generateRecurringPayables(): Promise<{
        generated: number;
    }>;
    findAllExpenseTypes(): Promise<ExpenseType[]>;
    createExpenseType(data: any): Promise<any>;
    updateExpenseType(id: string, data: any): Promise<ExpenseType>;
    deleteExpenseType(id: string): Promise<{
        success: boolean;
    }>;
    generateExpenseReport(startDate?: string, endDate?: string, classification?: string): Promise<{
        expenses: import("../../domain/expense.entity").Expense[];
        summary: {
            totalCosts: number;
            totalExpenses: number;
            totalGeneral: number;
            totalCAC: number;
            count: number;
            byType: Record<string, number>;
        };
        period: {
            startDate: string;
            endDate: string;
            classification: string;
        };
    }>;
    generatePayablesReport(status?: string, overdueOnly?: string): Promise<{
        payables: import("../../domain/payable.entity").Payable[];
        summary: {
            totalPending: number;
            totalPaid: number;
            totalOverdue: number;
            count: number;
        };
    }>;
    generateReceivablesReport(status?: string): Promise<{
        receivables: import("../../domain/receivable.entity").Receivable[];
        summary: {
            totalReceived: number;
            totalPending: number;
            totalOverdue: number;
            count: number;
        };
    }>;
    generateCashFlowReport(month?: string, year?: string): Promise<{
        month: number;
        year: number;
        receivables: import("../../domain/receivable.entity").Receivable[];
        expenses: import("../../domain/expense.entity").Expense[];
        forecasts: CashFlowForecast[];
        summary: {
            totalReceivables: number;
            totalReceived: number;
            totalCosts: number;
            totalExpenses: number;
            totalOutflows: number;
            balance: number;
            forecastBalance: number;
        };
    }>;
    generateContractsReport(status?: string): Promise<{
        contracts: import("../../domain/contract.entity").Contract[];
        summary: {
            total: number;
            active: number;
            totalValue: number;
        };
    }>;
    getUserPresets(page: string, userId?: string): Promise<import("../../domain/user-preset.entity").UserPreset[]>;
    createUserPreset(data: any): Promise<import("../../domain/user-preset.entity").UserPreset[]>;
    deleteUserPreset(id: string): Promise<{
        success: boolean;
    }>;
    exportLeads(): Promise<{
        filename: string;
        data: string;
        count: number;
    }>;
    importLeads(file: any): Promise<{
        success: boolean;
        imported: number;
        errors: number;
        details: {
            created: number;
            errors: any[];
        };
    }>;
    searchLeadsOnline(keywords: string): Promise<{
        title: string;
        company: string;
        contactName: string;
        contactPhone: string;
        contactEmail: string;
        estimatedValue: number;
        source: string;
    }[]>;
}
