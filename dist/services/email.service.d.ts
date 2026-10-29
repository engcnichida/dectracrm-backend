export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    sendApprovalCode(email: string, code: string, userName: string): Promise<void>;
    notifyAdminNewUser(adminEmail: string, userName: string, userEmail: string): Promise<void>;
    sendPaymentConfirmation(emails: string[], userName: string, amount: number, description: string, type: 'receber' | 'pagar'): Promise<void>;
    sendDueDateReminder(email: string, userName: string, amount: number, description: string, dueDate: string, type: 'receber' | 'pagar'): Promise<void>;
    sendEmail(data: {
        to: string | string[];
        subject: string;
        html: string;
    }): Promise<any>;
}
