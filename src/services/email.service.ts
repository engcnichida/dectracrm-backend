import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração do transporte SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para porta 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendActivationEmail(email: string, code: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Sistema Dectra" <noreply@dectra.com>',
      to: email,
      subject: 'Ative sua conta no Dectra CRM',
      html: `
        <h2>Olá!</h2>
        <p>Seu código de ativação é:</p>
        <h1 style="color: #2563eb; letter-spacing: 2px;">${code}</h1>
        <p>Use este código na tela de ativação para liberar seu acesso.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ E-mail de ativação enviado para ${email}. ID: ${info.messageId}`);
      
      // 🚨 DICA DE OURO: Enquanto você não configura o SMTP, descomente a linha abaixo 
      // para ver o código de ativação diretamente nos Logs do Render!
      // this.logger.log(`🔑 [MODO DEBUG] Código de ativação para ${email}: ${code}`);
      
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar e-mail para ${email}:`, error.message);
      // Em produção, você pode querer lançar o erro ou apenas logar, dependendo da sua regra de negócio
    }
  }
}