"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    constructor() {
        this.logger = new common_1.Logger(EmailService_1.name);
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.resend.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'resend',
                    pass: resendApiKey,
                },
            });
            this.logger.log('✅ E-mail configurado com Resend');
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.logger.log('✅ E-mail configurado com SMTP tradicional');
        }
    }
    async sendApprovalCode(email, code, userName) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
                to: email,
                subject: 'Código de Aprovação - Sistema Dectra',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e293b;">Olá, ${userName}!</h2>
            <p style="color: #475569;">Seu cadastro no <strong>Sistema Dectra de Gestão</strong> foi aprovado pelo administrador.</p>
            <p style="color: #475569;">Use o código abaixo para ativar sua conta:</p>
            <div style="background-color: #eff6ff; color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 14px;">Este código expira em 24 horas.</p>
            <p style="color: #64748b; font-size: 14px;">Se você não solicitou este cadastro, ignore este e-mail.</p>
          </div>
        `,
            });
            this.logger.log(`📧 E-mail de ativação enviado com sucesso para ${email} (Message ID: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`❌ Falha ao enviar e-mail para ${email}: ${error.message}`);
        }
    }
    async notifyAdminNewUser(adminEmail, userName, userEmail) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
                to: adminEmail,
                subject: ' Nova Solicitação de Cadastro - Dectra CRM',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e293b;">Nova solicitação de cadastro</h2>
            <p style="color: #475569;">Um novo usuário solicitou acesso ao sistema:</p>
            <ul style="color: #475569; line-height: 1.6;">
              <li><strong>Nome:</strong> ${userName}</li>
              <li><strong>E-mail:</strong> ${userEmail}</li>
            </ul>
            <p style="color: #475569;">Acesse o <strong>Painel Administrativo</strong> para aprovar o cadastro e definir as permissões.</p>
          </div>
        `,
            });
            this.logger.log(`📧 Notificação de novo usuário enviada para o admin (Message ID: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`❌ Falha ao notificar o admin: ${error.message}`);
        }
    }
    async sendPaymentConfirmation(emails, userName, amount, description, type) {
        try {
            const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
            const isReceber = type === 'receber';
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
                to: emails.join(', '),
                subject: isReceber ? '✅ Pagamento Confirmado - Dectra CRM' : '✅ Pagamento Realizado - Dectra CRM',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #166534;">Olá!</h2>
            <p style="color: #475569;">Informamos que o seguinte lançamento foi <strong>confirmado como pago</strong>:</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #166534;">
              <p style="margin: 0; color: #166534; font-size: 14px;"><strong>Descrição:</strong> ${description}</p>
              <p style="margin: 5px 0 0 0; color: #166534; font-size: 14px;"><strong>Valor:</strong> ${formattedAmount}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Obrigado por utilizar o Sistema Dectra de Gestão.</p>
          </div>
        `,
            });
            this.logger.log(`📧 Confirmação de pagamento enviada para ${emails.length} destinatários (ID: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`❌ Falha ao enviar confirmação de pagamento: ${error.message}`);
        }
    }
    async sendDueDateReminder(email, userName, amount, description, dueDate, type) {
        try {
            const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
            const isReceber = type === 'receber';
            const title = isReceber ? 'Lembrete de Fatura a Vencer' : 'Lembrete de Conta a Pagar';
            const color = isReceber ? '#2563eb' : '#d97706';
            const bgColor = isReceber ? '#eff6ff' : '#fffbeb';
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
                to: email,
                subject: `⏰ ${title} - Dectra CRM`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e293b;">Olá, ${userName}!</h2>
            <p style="color: #475569;">Este é um lembrete amigável de que o seguinte lançamento vence em breve:</p>
            <div style="background-color: ${bgColor}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
              <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Descrição:</strong> ${description}</p>
              <p style="margin: 5px 0; color: #334155; font-size: 14px;"><strong>Valor:</strong> ${formattedAmount}</p>
              <p style="margin: 5px 0 0 0; color: #334155; font-size: 14px;"><strong>Data de Vencimento:</strong> ${dueDate}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Caso o pagamento já tenha sido realizado, desconsidere este e-mail.</p>
          </div>
        `,
            });
            this.logger.log(`📧 Lembrete de vencimento enviado para ${email} (ID: ${info.messageId})`);
        }
        catch (error) {
            this.logger.error(`❌ Falha ao enviar lembrete de vencimento: ${error.message}`);
        }
    }
    async sendEmail(data) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
                to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
                subject: data.subject,
                html: data.html,
            });
            this.logger.log(`📧 E-mail enviado com sucesso para ${data.to} (ID: ${info.messageId})`);
            return info;
        }
        catch (error) {
            this.logger.error(`❌ Falha ao enviar e-mail: ${error.message}`);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map