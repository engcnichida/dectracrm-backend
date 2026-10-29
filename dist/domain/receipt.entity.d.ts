import { Supplier } from './supplier.entity';
export declare enum ReceiptType {
    PRO_LABORE = "PRO_LABORE",
    PJ = "PJ",
    RESSARCIMENTO = "RESSARCIMENTO"
}
export declare enum ReceiptStatus {
    PENDENTE = "PENDENTE",
    PAGO = "PAGO",
    CANCELADO = "CANCELADO"
}
export declare class Receipt {
    id: string;
    type: ReceiptType;
    receiptNumber: string;
    description: string;
    amount: number;
    receiptDate: Date;
    supplier?: Supplier;
    supplierId?: string;
    issuerName: string;
    issuerDocument: string;
    issuerAddress: string;
    linkedEntityType: string;
    linkedEntityId: string;
    status: ReceiptStatus;
    attachments: string[];
    notes: string;
    paymentMethod: string;
    city: string;
    createdAt: Date;
    updatedAt: Date;
}
