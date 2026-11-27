import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiClassifierService } from '../ai/ai-classifier.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../../domain/customer.entity';

@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly aiClassifier: AiClassifierService,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  @Post('whatsapp')
  async handleWhatsAppMessage(@Body() payload: any) {
    const messageText = payload.message?.conversation || payload.message?.extendedTextMessage?.text || payload.text || '';
    // ✅ O senderNumber já chega limpo, sem o "@s.whatsapp.net"
    const senderNumber = payload.key?.remoteJid?.replace('@s.whatsapp.net', '') || payload.from || '';

    if (!messageText || !senderNumber) {
      return { status: 'ignored', reason: 'No message or sender' };
    }

    this.logger.log(`Nova mensagem do WhatsApp: ${senderNumber} -> ${messageText}`);
    await this.processLeadResponse(senderNumber, messageText, 'WHATSAPP');
    
    return { status: 'success' };
  }

  @Post('email')
  async handleEmailReply(@Body() payload: any) {
    const messageText = payload.text || payload.html || '';
    const senderEmail = payload.from || '';

    if (!messageText || !senderEmail) {
      return { status: 'ignored', reason: 'No message or sender' };
    }

    this.logger.log(`Nova resposta de e-mail: ${senderEmail} -> ${messageText}`);
    await this.processLeadResponse(senderEmail, messageText, 'EMAIL');

    return { status: 'success' };
  }

  private async processLeadResponse(identifier: string, message: string, channel: 'WHATSAPP' | 'EMAIL') {
    const intent = await this.aiClassifier.classifyMessage(message);

    let newStatus = 'CONTATADO';
    if (intent === 'INTERESSADO') newStatus = 'NEGOCIACAO'; 
    if (intent === 'NAO_INTERESSADO') newStatus = 'PERDIDO';
    if (intent === 'AGENDAMENTO') newStatus = 'REUNIAO_AGENDADA';
    if (intent === 'DUVIDA') newStatus = 'TIRANDO_DUVIDAS';

    // ✅ CORREÇÃO: O 'identifier' já é o número limpo (ex: '5511999999999') ou o e-mail.
    // ⚠️ IMPORTANTE: Verifique no seu 'customer.entity.ts' se o campo de telefone se chama 'contactPhone' ou 'phone'.
    // Se se chamar 'phone', mude a linha abaixo para: { phone: Like(`%${identifier}%`) }
    const searchCondition = channel === 'WHATSAPP' 
      ? { contactPhone: Like(`%${identifier}%`) } 
      : { email: identifier };

    // ✅ Agora usamos a searchCondition correta, sem variáveis inexistentes
    const customer = await this.customerRepo.findOne({ 
      where: searchCondition 
    });

    if (customer) {
      (customer as any).customerStatus = newStatus; 
      (customer as any).ultima_interacao = new Date();
      (customer as any).observacao_ia = `IA classificou como ${intent} via ${channel}: "${message.substring(0, 50)}..."`;
      
      await this.customerRepo.save(customer);
      this.logger.log(`✅ Cliente atualizado para status: ${newStatus}`);
    } else {
      this.logger.warn(`⚠️ Cliente não encontrado para o identificador: ${identifier}`);
    }
  }
}