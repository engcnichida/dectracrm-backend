export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    sendActivationEmail(email: string, code: string): Promise<void>;
}
