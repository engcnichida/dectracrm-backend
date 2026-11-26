import { Module } from '@nestjs/common';
import { AiClassifierService } from './ai-classifier.service';

@Module({
  providers: [AiClassifierService],
  exports: [AiClassifierService], // Permite que outros módulos usem o serviço
})
export class AiModule {}