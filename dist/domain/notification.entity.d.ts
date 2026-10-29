export declare enum NotificationType {
    CADASTRO_SOLICITADO = "CADASTRO_SOLICITADO",
    CADASTRO_APROVADO = "CADASTRO_APROVADO",
    SENHA_ALTERADA = "SENHA_ALTERADA"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: Date;
}
