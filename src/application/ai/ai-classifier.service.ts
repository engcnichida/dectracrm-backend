import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

export type LeadIntent = 'INTERESSADO' | 'NAO_INTERESSADO' | 'DUVIDA' | 'AGENDAMENTO' | 'OUTRO';

@Injectable()
export class AiClassifierService {
  private readonly logger = new Logger(AiClassifierService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async classifyMessage(message: string): Promise<LeadIntent> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // ou 'gpt-4o-mini' para mais rapidez e custo menor
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de classificação de leads de uma empresa de energia solar. 
            Analise a mensagem do cliente e classifique a intenção APENAS em uma destas categorias exatas:
            - INTERESSADO (quer saber mais, pediu orçamento, demonstrou curiosidade positiva)
            - NAO_INTERESSADO (disse não, pediu para remover, não tem interesse)
            - DUVIDA (fez uma pergunta técnica, quer saber como funciona, mas não decidiu)
            - AGENDAMENTO (pediu para ligar depois, marcou reunião, pediu contato em data específica)
            - OUTRO (saudações genéricas, "ok", "obrigado", ou texto sem sentido)
            
            Responda APENAS com a palavra da categoria, sem pontuação ou explicação.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.1, // Baixa temperatura para respostas consistentes e determinísticas
      });

      const intent = response.choices[0].message.content?.trim().toUpperCase() as LeadIntent;
      this.logger.log(`Mensagem classificada como: ${intent}`);
      
      // Fallback de segurança caso a IA invente algo
      const validIntents: LeadIntent[] = ['INTERESSADO', 'NAO_INTERESSADO', 'DUVIDA', 'AGENDAMENTO', 'OUTRO'];
      return validIntents.includes(intent) ? intent : 'OUTRO';

    } catch (error) {
      this.logger.error('Erro ao classificar mensagem com IA:', error);
      return 'OUTRO'; // Em caso de falha, não altera o status do lead
    }
  }
}