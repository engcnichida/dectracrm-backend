export declare enum CustomerStatus {
    ATIVO = "ATIVO",
    INATIVO = "INATIVO",
    IMPLANTACAO = "IMPLANTACAO"
}
export declare class Customer {
    id: string;
    name: string;
    companyName: string;
    cnpj: string;
    cpf: string;
    address: string;
    city: string;
    state: string;
    cep: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    status: CustomerStatus;
    createdAt: Date;
    updatedAt: Date;
}
