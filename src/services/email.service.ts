import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Inicialização do serviço de e-mail (Resend/Nodemailer) pode ser feita aqui no futuro
  }

  /**
   * Método genérico de envio
   */
  async sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
    try {
      this.logger.log(`📧 Tentando enviar e-mail para: ${data.to} | Assunto: ${data.subject}`);
      this.logger.log(`✅ E-mail enviado com sucesso (ou simulado) para ${data.to}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`❌ Erro ao enviar e-mail para ${data.to}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Notifica o admin sobre novo usuário (aceita qualquer quantidade de argumentos)
   */
  async notifyAdminNewUser(...args: any[]) {
    this.logger.log(`🔔 Notificando admin sobre novo usuário (args recebidos: ${args.length})`);
  }

  /**
   * Envia código de aprovação (aceita qualquer quantidade de argumentos)
   */
  async sendApprovalCode(...args: any[]) {
    this.logger.log(`🔐 Enviando código de aprovação (args recebidos: ${args.length})`);
  }

  /**
   * Envia lembrete de vencimento (aceita qualquer quantidade de argumentos)
   */
  async sendDueDateReminder(...args: any[]) {
    this.logger.log(`⏰ Enviando lembrete de vencimento (args recebidos: ${args.length})`);
  }
}