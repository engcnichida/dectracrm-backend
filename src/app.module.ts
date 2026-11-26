import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './application/auth/auth.module';
import { CrmModule } from './application/crm/crm.module';
import { BackupModule } from './application/backup/backup.module';
import { ReceiptsModule } from './application/receipts/receipts.module';
import { CashFlowModule } from './application/financial/cash-flow.module';
import { suppliersModule } from './application/suppliers/suppliers.module';

// ✅ ADICIONE ESTES 2 IMPORTS
import { AiModule } from './application/ai/ai.module';
import { WebhooksModule } from './application/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),    

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      retryAttempts: 10,
      retryDelay: 3000,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    }),
    
    AuthModule,
    CrmModule,
    BackupModule,
    ReceiptsModule,
    CashFlowModule,
    suppliersModule,
    
    // ✅ ADICIONE ESTES 2 MÓDULOS AQUI
    AiModule,
    WebhooksModule,
  ],
})
export class AppModule {}