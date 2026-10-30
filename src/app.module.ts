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
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'dectra',
      password: process.env.DB_PASSWORD || 'dectra123',
      database: process.env.DB_DATABASE || 'dectra_crm',
      autoLoadEntities: true,
      synchronize: true,

      // ==========================================
      // CONFIGURAÇÕES DE RESILIÊNCIA DE CONEXÃO
      // ==========================================
      
      // 1. Tentativas de reconexão automática do TypeORM
      retryAttempts: 10,       // Tenta reconectar 10 vezes se cair
      retryDelay: 3000,        // Espera 3 segundos entre cada tentativa
      
      // 2. Configurações do Pool de Conexões (Driver pg)
      extra: {
        max: 20,               // Número máximo de conexões simultâneas no pool
        idleTimeoutMillis: 30000, // Fecha conexões ociosas após 30s (evita que o servidor as mate inesperadamente)
        connectionTimeoutMillis: 5000, // Tempo máximo para tentar estabelecer uma nova conexão (5s)
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