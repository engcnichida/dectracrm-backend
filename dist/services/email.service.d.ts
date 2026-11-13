export declare class EmailService {
    private readonly logger;
    constructor();
    sendEmail(data: {
        to: string;
        subject: string;
        html: string;
        text?: string;
    }): Promise<{
        success: boolean;
    }>;
    notifyAdminNewUser(...args: any[]): Promise<void>;
    sendApprovalCode(...args: any[]): Promise<void>;
    sendDueDateReminder(...args: any[]): Promise<void>;
}
