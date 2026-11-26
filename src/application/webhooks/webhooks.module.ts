import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { AiModule } from '../ai/ai.module';
import { Customer } from '../../domain/customer.entity'; // ✅ CORRIGIDO: customer.entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]), // ✅ CORRIGIDO: Customer
    AiModule,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}