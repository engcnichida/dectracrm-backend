import { Repository } from 'typeorm';
import { Receivable } from '../../domain/receivable.entity';
import { Payable } from '../../domain/payable.entity';
import { EmailService } from '../../services/email.service';
import { AlertSubscriberService } from '../auth/alert-subscriber.service';
export declare class FinancialAutomationService {
    private receivableRepo;
    private payableRepo;
    private emailService;
    private alertSubscriberService;
    private readonly logger;
    constructor(receivableRepo: Repository<Receivable>, payableRepo: Repository<Payable>, emailService: EmailService, alertSubscriberService: AlertSubscriberService);
    checkUpcomingDueDates(): Promise<void>;
    runManualTest(): Promise<{
        message: string;
        timestamp: string;
    }>;
}
