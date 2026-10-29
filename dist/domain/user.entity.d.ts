export declare enum UserStatus {
    PENDENTE = "PENDENTE",
    ATIVO = "ATIVO",
    BLOQUEADO = "BLOQUEADO"
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    GERENTE = "GERENTE",
    VENDEDOR = "VENDEDOR",
    FINANCEIRO = "FINANCEIRO",
    OPERACIONAL = "OPERACIONAL"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    permissions: Record<string, {
        view: boolean;
        edit: boolean;
    }>;
    approvalCode: string;
    approvalCodeExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
