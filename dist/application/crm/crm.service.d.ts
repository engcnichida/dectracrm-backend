import { Repository, DataSource } from 'typeorm';
import { RecurringExpense } from '../../domain/recurring-expense.entity';
import { Opportunity } from '../../domain/opportunity.entity';
import { Customer, CustomerStatus } from '../../domain/customer.entity';
import { Contract } from '../../domain/contract.entity';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { Expense } from '../../domain/expense.entity';
import { CashFlowForecast } from '../../domain/cash-flow-forecast.entity';
import { ExpenseType } from '../../domain/expense-type.entity';
import { UserPreset } from '../../domain/user-preset.entity';
import { ReceiptsService } from '../receipts/receipts.service';
export declare class CrmService {
    private readonly opportunityRepo;
    private readonly customerRepo;
    private readonly contractRepo;
    private readonly receivableRepo;
    private readonly recurringExpenseRepo;
    private readonly payableRepo;
    private readonly dataSource;
    private readonly expenseRepo;
    private readonly expenseTypeRepo;
    private readonly userPresetRepo;
    private readonly cashFlowForecastRepo;
    private readonly receiptsService;
    private readonly logger;
    constructor(opportunityRepo: Repository<Opportunity>, customerRepo: Repository<Customer>, contractRepo: Repository<Contract>, receivableRepo: Repository<Receivable>, recurringExpenseRepo: Repository<RecurringExpense>, payableRepo: Repository<Payable>, dataSource: DataSource, expenseRepo: Repository<Expense>, expenseTypeRepo: Repository<ExpenseType>, userPresetRepo: Repository<UserPreset>, cashFlowForecastRepo: Repository<CashFlowForecast>, receiptsService: ReceiptsService);
    getOpportunitiesBoard(): Promise<Record<string, any[]>>;
    createOpportunity(data: any): Promise<any>;
    updateOpportunity(id: string, data: any): Promise<Opportunity>;
    updateStage(id: string, stage: string): Promise<{
        opportunity: any;
        action: string;
        message: string;
    }>;
    deleteOpportunity(id: string): Promise<{
        success: boolean;
    }>;
    findAllCustomers(): Promise<Customer[]>;
    createCustomer(data: any): Promise<any>;
    updateCustomer(id: string, data: any): Promise<Customer>;
    deleteCustomer(id: string): Promise<{
        success: boolean;
    }>;
    getCustomerDetails(id: string): Promise<{
        contracts: Contract[];
        opportunities: Opportunity[];
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
        status: CustomerStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCustomerMetrics(): Promise<{
        totalCustomers: number;
        activeCustomers: number;
    }>;
    findOrCreateCustomer(data: any): Promise<any>;
    getCustomerWithContracts(customerId: string): Promise<{
        customer: Customer;
        contracts: any[];
    }>;
    archiveOpportunity(id: string, reason?: string): Promise<Opportunity>;
    getArchivedOpportunities(customerId?: string): Promise<Opportunity[]>;
    findAllContracts(): Promise<Contract[]>;
    updateContract(id: string, data: any): Promise<any>;
    deleteContract(id: string): Promise<{
        message: string;
    }>;
    findAllReceivables(): Promise<Receivable[]>;
    createContract(data: any): Promise<any>;
    markReceivableAsPaid(id: string, paidAt?: string): Promise<Receivable>;
    markReceivableAsOpen(id: string): Promise<Receivable>;
    updateReceivable(id: string, data: any): Promise<Receivable>;
    deleteReceivable(id: string): Promise<{
        success: boolean;
    }>;
    findAllPayables(): Promise<Payable[]>;
    createPayable(data: any): Promise<Payable[]>;
    markPayableAsPaid(id: string, data: any): Promise<any>;
    updatePayable(id: string, data: any): Promise<Payable>;
    deletePayable(id: string): Promise<{
        success: boolean;
    }>;
    findAllExpenses(): Promise<Expense[]>;
    createExpense(data: any): Promise<any>;
    private createPayableFromExpense;
    private generateCashFlowForecasts;
    private advanceDate;
    deleteExpense(id: string): Promise<{
        success: boolean;
    }>;
    getExpensesByCategory(): Promise<any[]>;
    getTotalExpenses(startDate?: string, endDate?: string): Promise<number>;
    getCashFlowForecasts(month?: number, year?: number): Promise<CashFlowForecast[]>;
    getCashFlowSummary(): Promise<any[]>;
    getFinancialDashboard(): Promise<{
        totalReceivables: number;
        totalCosts: number;
        totalExpenses: number;
        totalOutflows: number;
        balance: number;
        totalPendingReceivables: number;
        totalPendingPayables: number;
    }>;
    getContractsPendingReceivables(): Promise<Receivable[]>;
    markContractReceivablesAsOverdue(contractId: string): Promise<{
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
    getChartsData(): Promise<{
        receivablesByStatus: {
            RECEBIDO: number;
            PENDENTE: number;
            ATRASADO: number;
            CANCELADO: number;
        };
        pipelinePieData: {
            name: string;
            value: number;
            fill: string;
        }[];
    }>;
    setInitialBalance(date: string, amount: number): Promise<{
        success: boolean;
        message: string;
    }>;
    markAsPaid(entityId: string, type: 'receivable' | 'payable'): Promise<any>;
    addAlertSubscriber(email: string): Promise<{
        message: string;
        email: string;
        error?: undefined;
    } | {
        message: string;
        error: any;
        email?: undefined;
    }>;
    findAllRecurringExpenses(): Promise<RecurringExpense[]>;
    createRecurringExpense(data: any): Promise<any>;
    updateRecurringExpense(id: string, data: any): Promise<RecurringExpense>;
    deleteRecurringExpense(id: string): Promise<{
        success: boolean;
    }>;
    generateRecurringPayables(): Promise<{
        generated: number;
    }>;
    updateExpense(id: string, data: any): Promise<Expense>;
    generateExpenseReport(startDate?: string, endDate?: string, classification?: string): Promise<{
        expenses: Expense[];
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
    generatePayablesReport(status?: string, overdueOnly?: boolean): Promise<{
        payables: Payable[];
        summary: {
            totalPending: number;
            totalPaid: number;
            totalOverdue: number;
            count: number;
        };
    }>;
    generateReceivablesReport(status?: string): Promise<{
        receivables: Receivable[];
        summary: {
            totalReceived: number;
            totalPending: number;
            totalOverdue: number;
            count: number;
        };
    }>;
    generateCashFlowReport(month?: number, year?: number): Promise<{
        month: number;
        year: number;
        receivables: Receivable[];
        expenses: Expense[];
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
        contracts: Contract[];
        summary: {
            total: number;
            active: number;
            totalValue: number;
        };
    }>;
    getMonthlyFinancialData(months?: number, startDate?: string, endDate?: string): Promise<{
        month: string;
        monthShort: string;
        year: number;
        monthNumber: number;
        receivables: number;
        costs: number;
        expenses: number;
    }[]>;
    getUserPresets(page: string, userId?: string): Promise<UserPreset[]>;
    createUserPreset(data: any): Promise<UserPreset[]>;
    deleteUserPreset(id: string): Promise<{
        success: boolean;
    }>;
    findAllExpenseTypes(): Promise<ExpenseType[]>;
    createExpenseType(data: any): Promise<any>;
    updateExpenseType(id: string, data: any): Promise<ExpenseType>;
    deleteExpenseType(id: string): Promise<{
        success: boolean;
    }>;
    exportOpportunitiesToCSV(): Promise<{
        ID: string;
        Titulo: string;
        Cliente: string;
        Estagio: string;
        Valor_Estimado: string;
        Data_Criacao: string;
    }[]>;
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
    automateRecurringExpenses(): Promise<void>;
}
