import { Customer } from './customer.entity';
export declare class Contract {
    id: string;
    customerId: string;
    customer: Customer;
    type: string;
    totalValue: number;
    startDate: Date;
    endDate: Date;
    billingDate: Date;
    status: string;
    installments: number;
    frequency: string;
    paymentCondition: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}
