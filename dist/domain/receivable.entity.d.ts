import { Contract } from './contract.entity';
export declare enum ReceivableStatus {
    PENDENTE = "PENDENTE",
    RECEBIDO = "RECEBIDO",
    ATRASADO = "ATRASADO",
    CANCELADO = "CANCELADO"
}
export declare class Receivable {
    id: string;
    contractId: string;
    contract: Contract;
    description: string;
    amount: number;
    paidAmount: number;
    dueDate: Date;
    category: string;
    type: string;
    paidAt: Date;
    status: ReceivableStatus;
    createdAt: Date;
    updatedAt: Date;
}
