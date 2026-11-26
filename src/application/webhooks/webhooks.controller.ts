import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiClassifierService, LeadIntent } from '../ai/ai-classifier.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../../domain/customer.entity'; // ✅ CORRIGIDO: customer.entity

@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly aiClassifier: AiClassifierService,
    @InjectRepository(Customer) // ✅ CORRIGIDO: Customer
    private readonly customerRepo: Repository<Customer>,
  ) {}

  @Post('whatsapp')
  async handleWhatsAppMessage(@Body() payload: any) {
    const messageText = payload.message?.conversation || payload.message?.extendedTextMessage?.text || payload.text || '';
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

    // ⚠️ AJUSTE: Usei 'cntactPhone' e 'customerStatus' conforme você informou. 
    // Se no customer.entity.ts o telefone se chamar 'phone' ou 'telefone', ajuste aqui.
    const searchCondition = channel === 'WHATSAPP' 
      ? { cntactPhone: Like(`%${identifier}%`) } 
      : { email: identifier };

    const customer = await this.customerRepo.findOne({ where: searchCondition as any });

    if (customer) {
      (customer as any).customerStatus = newStatus; // ✅ Coluna exata do status
      (customer as any).ultima_interacao = new Date();
      (customer as any).observacao_ia = `IA classificou como ${intent} via ${channel}: "${message.substring(0, 50)}..."`;
      
      await this.customerRepo.save(customer);
      this.logger.log(`✅ Cliente atualizado para status: ${newStatus}`);
    } else {
      this.logger.warn(`⚠️ Cliente não encontrado para o identificador: ${identifier}`);
    }
  }
}