import { CrmService } from '../crm/crm.service';
export declare class RecurringExpenseAutomationService {
    private readonly crmService;
    constructor(crmService: CrmService);
    handleCron(): Promise<void>;
}
