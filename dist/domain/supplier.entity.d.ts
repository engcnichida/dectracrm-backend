import { Receipt } from './receipt.entity';
export declare class Supplier {
    id: string;
    name: string;
    cnpj?: string;
    email?: string;
    phone?: string;
    address?: string;
    bankInfo?: string;
    defaultDescription?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    receipts?: Receipt[];
}
