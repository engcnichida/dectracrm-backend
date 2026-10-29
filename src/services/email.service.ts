import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Verifica se estamos usando Resend ou SMTP tradicional (Gmail)
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Configuração para Resend
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
    } else {
      // Configuração para SMTP tradicional (Gmail, etc.)
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

  async sendApprovalCode(email: string, code: string, userName: string) {
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
    } catch (error: any) {
      this.logger.error(`❌ Falha ao enviar e-mail para ${email}: ${error.message}`);
    }
  }

  async notifyAdminNewUser(adminEmail: string, userName: string, userEmail: string) {
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
    } catch (error: any) {
      this.logger.error(`❌ Falha ao notificar o admin: ${error.message}`);
    }
  }
  // Envia confirmação de pagamento
  // Envia confirmação de pagamento para múltiplos destinatários
  async sendPaymentConfirmation(emails: string[], userName: string, amount: number, description: string, type: 'receber' | 'pagar') {
    try {
      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
      const isReceber = type === 'receber';
      
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
        to: emails.join(', '), // 👈 Envia para todos os destinatários
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
    } catch (error: any) {
      this.logger.error(`❌ Falha ao enviar confirmação de pagamento: ${error.message}`);
    }
  }

  // Envia lembrete de vencimento (3 dias antes)
  async sendDueDateReminder(email: string, userName: string, amount: number, description: string, dueDate: string, type: 'receber' | 'pagar') {
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
    } catch (error: any) {
      this.logger.error(`❌ Falha ao enviar lembrete de vencimento: ${error.message}`);
    }
  }
  // ==========================================
  // MÉTODO GENÉRICO PARA ENVIO DE E-MAILS
  // ==========================================
  async sendEmail(data: { to: string | string[]; subject: string; html: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        html: data.html,
      });
      this.logger.log(`📧 E-mail enviado com sucesso para ${data.to} (ID: ${info.messageId})`);
      return info;
    } catch (error: any) {
      this.logger.error(`❌ Falha ao enviar e-mail: ${error.message}`);
      throw error;
    }
  }
}
