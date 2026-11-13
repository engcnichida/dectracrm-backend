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
import { suppliersModule } from './application/suppliers/suppliers.module'; // Corrigido para maiúscula

@Module({
  imports: [
    // 1. Configuração de Variáveis de Ambiente (LEMBRE-SE: O .env PRECISA TER O DATABASE_URL)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Agendador de Tarefas (Apenas UMA vez)
    ScheduleModule.forRoot(),

    // 3. Servir Arquivos Estáticos (Uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),    

    // 4. Conexão com o Banco de Dados
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // ⚠️ ESTA VARIÁVEL PRECISA ESTAR NO SEU .env!
      
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
    
    // 5. Seus Módulos da Aplicação
    AuthModule,
    CrmModule,
    BackupModule,
    ReceiptsModule,
    CashFlowModule,
    suppliersModule,
  ],
})
export class AppModule {}