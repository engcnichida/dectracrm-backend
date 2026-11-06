import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Se quiser integrar com Resend ou Nodemailer no futuro, inicialize aqui
    // this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Método genérico de envio (usado pelo backup, por exemplo)
   */
  async sendEmail(data: { to: string; subject: string; html: string; text?: string }) {
    try {
      this.logger.log(`📧 Tentando enviar e-mail para: ${data.to} | Assunto: ${data.subject}`);
      
      // TODO: Implementar envio real com Resend ou Nodemailer aqui
      // Exemplo com Resend:
      // const { data: resendData, error } = await this.resend.emails.send({
      //   from: 'Dectra CRM <onboarding@resend.dev>',
      //   to: [data.to],
      //   subject: data.subject,
      //   html: data.html,
      // });
      
      this.logger.log(`✅ E-mail enviado com sucesso (ou simulado) para ${data.to}`);
      return { success: true };
      
    } catch (error: any) { // ✅ CORREÇÃO: 'any' permite acessar error.message
      this.logger.error(`❌ Erro ao enviar e-mail para ${data.to}:`, error.message || error);
      throw error;
    }
  }

  /**
   * Notifica o admin sobre novo usuário
   */
  async notifyAdminNewUser(adminEmail: string, userName: string, userEmail: string) {
    this.logger.log(`🔔 Notificando admin (${adminEmail}) sobre novo usuário: ${userName} (${userEmail})`);
    // await this.sendEmail({
    //   to: adminEmail,
    //   subject: 'Novo Usuário Registrado',
    //   html: `<p>O usuário <strong>${userName}</strong> (${userEmail}) foi registrado.</p>`
    // });
  }

  /**
   * Envia código de aprovação para o usuário
   */
  async sendApprovalCode(email: string, code: string, name: string) {
    this.logger.log(`🔐 Enviando código de aprovação ${code} para ${email}`);
    // await this.sendEmail({
    //   to: email,
    //   subject: 'Seu Código de Aprovação',
    //   html: `<p>Olá ${name}, seu código é: <strong>${code}</strong></p>`
    // });
  }

  /**
   * Envia lembrete de vencimento (usado pela automação financeira)
   */
  async sendDueDateReminder(email: string, name: string, dueDate: string, amount: number) {
    this.logger.log(`⏰ Enviando lembrete de vencimento para ${email} (Valor: ${amount})`);
    // await this.sendEmail({
    //   to: email,
    //   subject: 'Lembrete de Vencimento',
    //   html: `<p>Olá ${name}, seu vencimento para ${dueDate} no valor de R$ ${amount} está próximo.</p>`
    // });
  }
}