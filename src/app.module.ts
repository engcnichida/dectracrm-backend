import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './application/auth/auth.module';
import { CrmModule } from './application/crm/crm.module';
import { BackupModule } from './application/backup/backup.module';
import { Receipt } from './domain/receipt.entity';
import { ReceiptsModule } from './application/receipts/receipts.module';
import { CashFlowModule } from './application/financial/cash-flow.module';
import { suppliersModule } from './application/suppliers/suppliers.module';

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
      url: process.env.DATABASE_URL, // Usa a string de conexão completa do Neon (já inclui sslmode=require)
      
      // Força SSL em produção (Render), mas mantém falso localmente para não quebrar seu PC
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      
      autoLoadEntities: true,
      synchronize: true, // ⚠️ NUNCA deixe true em produção para não apagar dados!

      // Configurações de resiliência de conexão
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
    Receipt,
    ScheduleModule.forRoot(),
    CashFlowModule,
    suppliersModule,
  ],
})
export class AppModule {}