import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiClassifierService, LeadIntent } from '../ai/ai-classifier.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Client } from '../../domain/client.entity'; // ✅ Entidade correta

@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly aiClassifier: AiClassifierService,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  @Post('whatsapp')
  async handleWhatsAppMessage(@Body() payload: any) {
    // Tenta extrair o texto e o número de várias estruturas comuns de webhook (Evolution API, etc.)
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
    // 1. Classificar a intenção com a IA
    const intent = await this.aiClassifier.classifyMessage(message);

    // 2. Mapear intenção para o status do seu funil (ajuste os valores se forem diferentes no seu enum)
    let newStatus = 'CONTATADO';
    if (intent === 'INTERESSADO') newStatus = 'NEGOCIACAO'; 
    if (intent === 'NAO_INTERESSADO') newStatus = 'PERDIDO';
    if (intent === 'AGENDAMENTO') newStatus = 'REUNIAO_AGENDADA';
    if (intent === 'DUVIDA') newStatus = 'TIRANDO_DUVIDAS';

    // 3. Buscar o cliente no banco usando as colunas exatas que você informou
    const searchCondition = channel === 'WHATSAPP' 
      ? { contactPhone: Like(`%${identifier}%`) } // ✅ Coluna exata do telefone
      : { contactEmail: identifier }; // Assumindo que a coluna de e-mail se chama 'email'

    const client = await this.clientRepo.findOne({ where: searchCondition as any });

    if (client) {
      // 4. Atualizar o status e adicionar observação da IA
      (client as any).customerStatus = newStatus; // ✅ Coluna exata do status
      (client as any).ultima_interacao = new Date(); // Se essa coluna existir, senão o TypeORM ignora ou você pode remover
      (client as any).observacao_ia = `IA classificou como ${intent} via ${channel}: "${message.substring(0, 50)}..."`; // Opcional, remova se a coluna não existir
      
      await this.clientRepo.save(client);
      this.logger.log(`✅ Cliente atualizado para status: ${newStatus}`);
    } else {
      this.logger.warn(`⚠️ Cliente não encontrado para o identificador: ${identifier}`);
    }
  }
}