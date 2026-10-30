import { User } from './user.entity';
export declare class AlertSubscriber {
    id: string;
    user: User;
    userId: string;
    receivePaymentConfirmations: boolean;
    receiveDueDateReminders: boolean;
    createdAt: Date;
}
