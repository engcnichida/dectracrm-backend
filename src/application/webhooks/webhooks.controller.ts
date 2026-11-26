import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiClassifierService, LeadIntent } from '../ai/ai-classifier.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// ⚠️ IMPORTANTE: Ajuste este import para a entidade correta do seu lead/usina
import { SolarPlant } from '../../domain/solar-plant.entity'; 

@Controller('api/v1/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly aiClassifier: AiClassifierService,
    @InjectRepository(SolarPlant)
    private readonly plantRepo: Repository<SolarPlant>,
  ) {}

  // Exemplo para WhatsApp (Evolution API)
  @Post('whatsapp')
  async handleWhatsAppMessage(@Body() payload: any) {
    // A estrutura do payload depende da Evolution API. Ajuste conforme seu webhook real.
    const messageText = payload.message?.conversation || payload.message?.extendedTextMessage?.text || '';
    const senderNumber = payload.key?.remoteJid?.replace('@s.whatsapp.net', '') || '';

    if (!messageText || !senderNumber) {
      return { status: 'ignored', reason: 'No message or sender' };
    }

    this.logger.log(`Nova mensagem do WhatsApp: ${senderNumber} -> ${messageText}`);
    await this.processLeadResponse(senderNumber, messageText, 'WHATSAPP');
    
    return { status: 'success' };
  }

  // Exemplo para E-mail (Resend Inbound)
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

  // Lógica central de processamento e atualização do banco
  private async processLeadResponse(identifier: string, message: string, channel: 'WHATSAPP' | 'EMAIL') {
    // 1. Classificar com IA
    const intent = await this.aiClassifier.classifyMessage(message);

    // 2. Mapear intenção para o status do seu funil
    let newStatus = 'CONTATADO'; // Padrão
    if (intent === 'INTERESSADO') newStatus = 'NEGOCIACAO'; // Ajuste para o nome exato do seu status
    if (intent === 'NAO_INTERESSADO') newStatus = 'PERDIDO';
    if (intent === 'AGENDAMENTO') newStatus = 'REUNIAO_AGENDADA';
    if (intent === 'DUVIDA') newStatus = 'TIRANDO_DUVIDAS';

    // 3. Encontrar o lead e atualizar
    // ⚠️ Ajuste a lógica de busca: por telefone (whatsapp) ou por e-mail
    const searchCondition = channel === 'WHATSAPP' 
      ? { telefone: Like(`%${identifier}%`) } // Se usar TypeORM Like
      : { email: identifier };

    // Nota: Se sua entidade de contato for separada da usina, ajuste a query abaixo.
    // Este é um exemplo genérico buscando na tabela de Usinas/Leads.
    const lead = await this.plantRepo.findOne({ 
      where: channel === 'WHATSAPP' ? { telefone: identifier } : { email: identifier } as any 
    });

    if (lead) {
      // ⚠️ Ajuste 'prospeccao_status' para o nome exato da coluna no seu banco
      (lead as any).prospeccao_status = newStatus;
      (lead as any).ultima_interacao = new Date();
      (lead as any).observacao_ia = `IA classificou como ${intent} via ${channel}: "${message.substring(0, 50)}..."`;
      
      await this.plantRepo.save(lead);
      this.logger.log(`✅ Lead ${lead.id} atualizado para status: ${newStatus}`);
    } else {
      this.logger.warn(`⚠️ Lead não encontrado para o identificador: ${identifier}`);
    }
  }
}