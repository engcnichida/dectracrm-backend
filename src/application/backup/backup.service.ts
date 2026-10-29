import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Backup } from '../../domain/backup.entity';
import { EmailService } from '../../services/email.service';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly retentionDays: number;
  private readonly isEnabled: boolean;
  private readonly compress: boolean;
  private readonly notifyEmail: string;
  private isRunning = false;

  constructor(
    @InjectRepository(Backup)
    private readonly backupRepo: Repository<Backup>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.backupDir = path.resolve(
      this.configService.get<string>('BACKUP_DIR', './backups')
    );
    this.retentionDays = parseInt(
      this.configService.get<string>('BACKUP_RETENTION_DAYS', '30')
    );
    this.isEnabled = this.configService.get<string>('BACKUP_ENABLED', 'true') === 'true';
    this.compress = false; // Windows não suporta gzip nativamente
    this.notifyEmail = this.configService.get<string>(
      'BACKUP_NOTIFY_EMAIL',
      'admin@dectra.com'
    );

    // Garantir que a pasta de backups existe
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      this.logger.log(`📁 Pasta de backups criada: ${this.backupDir}`);
    }
  }

  // ==========================================
  // BACKUP AUTOMÁTICO DIÁRIO (Cron)
  // ==========================================
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledBackup() {
    if (!this.isEnabled) {
      this.logger.log('⏸️  Backup automático desabilitado via configuração');
      return;
    }

    this.logger.log('⏰ [Backup Automático] Iniciando backup agendado...');
    await this.createBackup('system', 'automatic');
  }

  // ==========================================
  // CRIAR BACKUP
  // ==========================================
  async createBackup(
    triggeredBy: string = 'manual',
    type: 'manual' | 'automatic' = 'manual'
  ): Promise<Backup> {
    if (this.isRunning) {
      throw new Error('Já existe um backup em execução. Aguarde a conclusão.');
    }

    this.isRunning = true;
    const startTime = Date.now();

    // Registrar início no banco
    const backupRecord = this.backupRepo.create({
      filename: 'in_progress',
      filepath: '',
      sizeBytes: 0,
      type,
      status: 'IN_PROGRESS',
      triggeredBy,
    });
    const savedRecord = await this.backupRepo.save(backupRecord);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `backup_${timestamp}.sql`;
      const filepath = path.join(this.backupDir, filename);

      this.logger.log(`🔄 [Backup] Criando: ${filename}`);

      // Configuração do banco
      const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
      const dbPort = this.configService.get<string>('DB_PORT', '5432');
      const dbUser = this.configService.get<string>('DB_USERNAME', 'dectra');
      const dbName = this.configService.get<string>('DB_DATABASE', 'dectra_crm');
      const dbPassword = this.configService.get<string>('DB_PASSWORD', 'dectra123');

      // Monta o comando pg_dump
      // No Windows com Docker, usamos docker exec para executar pg_dump dentro do container
      // Monta o comando pg_dump (compatível com Windows - sem gzip)
      const filepathNormalized = filepath.replace(/\\/g, '/');
      const command = `docker exec dectracrm-cloud-db-1 pg_dump -U ${dbUser} -d ${dbName} > "${filepathNormalized}"`;

      // Executar o backup (usando cmd.exe no Windows)
      await execAsync(command, { 
        maxBuffer: 1024 * 1024 * 100, // 100MB buffer
        timeout: 1000 * 60 * 10, // 10 minutos timeout
        shell: 'cmd.exe',
      });

      // Verificar se o arquivo foi criado
      if (!fs.existsSync(filepath)) {
        throw new Error('Arquivo de backup não foi criado');
      }

      const stats = fs.statSync(filepath);
      const duration = Date.now() - startTime;

      // Atualizar registro no banco
      await this.backupRepo.update(savedRecord.id, {
        filename,
        filepath,
        sizeBytes: stats.size,
        status: 'SUCCESS',
        durationMs: duration,
      });

      const updatedRecord = await this.backupRepo.findOne({
        where: { id: savedRecord.id },
      });

      this.logger.log(
        `✅ [Backup] Concluído em ${(duration / 1000).toFixed(2)}s | ` +
        `Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
      );

      // Limpeza de backups antigos
      await this.cleanupOldBackups();

      // Notificar por e-mail
      await this.sendNotification('success', updatedRecord!);

      return updatedRecord!;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`❌ [Backup] Falhou: ${errorMessage}`);

      await this.backupRepo.update(savedRecord.id, {
        status: 'FAILED',
        errorMessage,
        durationMs: duration,
      });

      const failedRecord = await this.backupRepo.findOne({
        where: { id: savedRecord.id },
      });

      // Notificar falha por e-mail
      await this.sendNotification('failed', failedRecord!, errorMessage);

      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // ==========================================
  // LISTAR BACKUPS
  // ==========================================
  async listBackups(limit: number = 50): Promise<Backup[]> {
    return this.backupRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // ==========================================
  // OBTER BACKUP POR ID
  // ==========================================
  async getBackupById(id: string): Promise<Backup | null> {
    return this.backupRepo.findOne({ where: { id } });
  }

  // ==========================================
  // DELETAR BACKUP
  // ==========================================
  async deleteBackup(id: string): Promise<{ success: boolean }> {
    const backup = await this.backupRepo.findOne({ where: { id } });
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    // Deletar arquivo físico
    if (fs.existsSync(backup.filepath)) {
      fs.unlinkSync(backup.filepath);
    }

    await this.backupRepo.remove(backup);
    return { success: true };
  }

  // ==========================================
  // OBTER ESTATÍSTICAS
  // ==========================================
  async getStats() {
    const totalBackups = await this.backupRepo.count();
    const successfulBackups = await this.backupRepo.count({
      where: { status: 'SUCCESS' },
    });
    const failedBackups = await this.backupRepo.count({
      where: { status: 'FAILED' },
    });

    const totalSizeResult = await this.backupRepo
      .createQueryBuilder('b')
      .select('SUM(b."sizeBytes")', 'total')
      .where('b.status = :status', { status: 'SUCCESS' })
      .getRawOne();

    const totalSize = Number(totalSizeResult?.total) || 0;

    const lastBackup = await this.backupRepo.findOne({
      where: { status: 'SUCCESS' },
      order: { createdAt: 'DESC' },
    });

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      lastBackupAt: lastBackup?.createdAt || null,
      lastBackupStatus: lastBackup?.status || null,
      isRunning: this.isRunning,
    };
  }

  // ==========================================
  // LIMPEZA DE BACKUPS ANTIGOS
  // ==========================================
  private async cleanupOldBackups() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const oldBackups = await this.backupRepo.find({
      where: {
        createdAt: MoreThan(new Date(0)),
      },
    });

    const toDelete = oldBackups.filter((b) => new Date(b.createdAt) < cutoffDate);

    for (const backup of toDelete) {
      try {
        if (fs.existsSync(backup.filepath)) {
          fs.unlinkSync(backup.filepath);
        }
        await this.backupRepo.remove(backup);
        this.logger.log(`🗑️  [Cleanup] Backup antigo removido: ${backup.filename}`);
      } catch (error) {
        this.logger.error(`❌ [Cleanup] Erro ao remover backup: ${error}`);
      }
    }

    if (toDelete.length > 0) {
      this.logger.log(`✅ [Cleanup] ${toDelete.length} backup(s) antigo(s) removido(s)`);
    }
  }

  // ==========================================
  // NOTIFICAÇÃO POR E-MAIL
  // ==========================================
  private async sendNotification(
    type: 'success' | 'failed',
    backup: Backup,
    errorMessage?: string
  ) {
    try {
      const subject =
        type === 'success'
          ? '✅ Backup Realizado com Sucesso'
          : '❌ Falha no Backup do Sistema';

      const sizeMB = (Number(backup.sizeBytes) / 1024 / 1024).toFixed(2);
      const duration = backup.durationMs
        ? `${(backup.durationMs / 1000).toFixed(2)}s`
        : 'N/A';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${type === 'success' ? '#16a34a' : '#dc2626'}; 
                      color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">${subject}</h2>
          </div>
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <p><strong>Arquivo:</strong> ${backup.filename}</p>
            <p><strong>Tamanho:</strong> ${sizeMB} MB</p>
            <p><strong>Duração:</strong> ${duration}</p>
            <p><strong>Tipo:</strong> ${backup.type === 'automatic' ? 'Automático' : 'Manual'}</p>
            <p><strong>Data:</strong> ${new Date(backup.createdAt).toLocaleString('pt-BR')}</p>
            ${errorMessage ? `<p style="color: #dc2626;"><strong>Erro:</strong> ${errorMessage}</p>` : ''}
          </div>
          <div style="background: #e2e8f0; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #64748b;">
            Sistema Dectra de Gestão
          </div>
        </div>
      `;

      await this.emailService.sendEmail({
        to: this.notifyEmail,
        subject,
        html,
      });

      this.logger.log(`📧 [Backup] Notificação enviada para ${this.notifyEmail}`);
    } catch (error) {
      this.logger.error(`❌ [Backup] Erro ao enviar notificação: ${error}`);
      // Não relançar - o backup em si funcionou
    }
  }
}