import { Repository } from 'typeorm';
import { AlertSubscriber } from '../../domain/alert-subscriber.entity';
import { User } from '../../domain/user.entity';
export declare class AlertSubscriberService {
    private subscriberRepo;
    private userRepo;
    constructor(subscriberRepo: Repository<AlertSubscriber>, userRepo: Repository<User>);
    getSubscribers(adminId: string): Promise<AlertSubscriber[]>;
    addSubscriber(adminId: string, userId: string, receivePaymentConfirmations: boolean, receiveDueDateReminders: boolean): Promise<AlertSubscriber>;
    removeSubscriber(adminId: string, subscriberId: string): Promise<{
        message: string;
    }>;
    getPaymentConfirmationRecipients(): Promise<string[]>;
    getDueDateReminderRecipients(): Promise<string[]>;
}
