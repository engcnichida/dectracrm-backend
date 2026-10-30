import { Customer } from './customer.entity';
export declare class Opportunity {
    id: string;
    title: string;
    company: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    estimatedValue: number;
    expectedCloseDate: Date;
    description: string;
    pipelineStage: string;
    customer: Customer;
    archived: boolean;
    archivedAt: Date;
    archiveReason: string;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
}
