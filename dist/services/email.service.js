"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    async sendEmail(data) {
        try {
            this.logger.log(`📧 Tentando enviar e-mail para: ${data.to} | Assunto: ${data.subject}`);
            this.logger.log(`✅ E-mail enviado com sucesso (ou simulado) para ${data.to}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`❌ Erro ao enviar e-mail para ${data.to}:`, error.message || error);
            throw error;
        }
    }
    async notifyAdminNewUser(...args) {
        this.logger.log(`🔔 Notificando admin sobre novo usuário (args recebidos: ${args.length})`);
    }
    async sendApprovalCode(...args) {
        this.logger.log(`🔐 Enviando código de aprovação (args recebidos: ${args.length})`);
    }
    async sendDueDateReminder(...args) {
        this.logger.log(`⏰ Enviando lembrete de vencimento (args recebidos: ${args.length})`);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map