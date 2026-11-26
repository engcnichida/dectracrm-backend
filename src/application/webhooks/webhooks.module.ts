import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { AiModule } from '../ai/ai.module';
import { Client } from '../../domain/client.entity'; // ✅ Entidade correta

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]), // ✅ Registrando Client
    AiModule,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}