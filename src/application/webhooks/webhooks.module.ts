import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { AiModule } from '../ai/ai.module';

// ⚠️ IMPORTANTE: Ajuste este import para a entidade correta do seu projeto
// Se for SolarPlant, Lead, ou outra entidade, mude aqui
import { SolarPlant } from '../../domain/solar-plant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolarPlant]), // Registra a entidade para uso no controller
    AiModule, // Importa o serviço de IA
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}