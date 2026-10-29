"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const backup_entity_1 = require("../../domain/backup.entity");
const email_service_1 = require("../../services/email.service");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    constructor(backupRepo, configService, emailService) {
        this.backupRepo = backupRepo;
        this.configService = configService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.isRunning = false;
        this.backupDir = path.resolve(this.configService.get('BACKUP_DIR', './backups'));
        this.retentionDays = parseInt(this.configService.get('BACKUP_RETENTION_DAYS', '30'));
        this.isEnabled = this.configService.get('BACKUP_ENABLED', 'true') === 'true';
        this.compress = false;
        this.notifyEmail = this.configService.get('BACKUP_NOTIFY_EMAIL', 'admin@dectra.com');
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            this.logger.log(`📁 Pasta de backups criada: ${this.backupDir}`);
        }
    }
    async handleScheduledBackup() {
        if (!this.isEnabled) {
            this.logger.log('⏸️  Backup automático desabilitado via configuração');
            return;
        }
        this.logger.log('⏰ [Backup Automático] Iniciando backup agendado...');
        await this.createBackup('system', 'automatic');
    }
    async createBackup(triggeredBy = 'manual', type = 'manual') {
        if (this.isRunning) {
            throw new Error('Já existe um backup em execução. Aguarde a conclusão.');
        }
        this.isRunning = true;
        const startTime = Date.now();
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
            const dbHost = this.configService.get('DB_HOST', 'localhost');
            const dbPort = this.configService.get('DB_PORT', '5432');
            const dbUser = this.configService.get('DB_USERNAME', 'dectra');
            const dbName = this.configService.get('DB_DATABASE', 'dectra_crm');
            const dbPassword = this.configService.get('DB_PASSWORD', 'dectra123');
            const filepathNormalized = filepath.replace(/\\/g, '/');
            const command = `docker exec dectracrm-cloud-db-1 pg_dump -U ${dbUser} -d ${dbName} > "${filepathNormalized}"`;
            await execAsync(command, {
                maxBuffer: 1024 * 1024 * 100,
                timeout: 1000 * 60 * 10,
                shell: 'cmd.exe',
            });
            if (!fs.existsSync(filepath)) {
                throw new Error('Arquivo de backup não foi criado');
            }
            const stats = fs.statSync(filepath);
            const duration = Date.now() - startTime;
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
            this.logger.log(`✅ [Backup] Concluído em ${(duration / 1000).toFixed(2)}s | ` +
                `Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            await this.cleanupOldBackups();
            await this.sendNotification('success', updatedRecord);
            return updatedRecord;
        }
        catch (error) {
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
            await this.sendNotification('failed', failedRecord, errorMessage);
            throw error;
        }
        finally {
            this.isRunning = false;
        }
    }
    async listBackups(limit = 50) {
        return this.backupRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getBackupById(id) {
        return this.backupRepo.findOne({ where: { id } });
    }
    async deleteBackup(id) {
        const backup = await this.backupRepo.findOne({ where: { id } });
        if (!backup) {
            throw new Error('Backup não encontrado');
        }
        if (fs.existsSync(backup.filepath)) {
            fs.unlinkSync(backup.filepath);
        }
        await this.backupRepo.remove(backup);
        return { success: true };
    }
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
    async cleanupOldBackups() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
        const oldBackups = await this.backupRepo.find({
            where: {
                createdAt: (0, typeorm_2.MoreThan)(new Date(0)),
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
            }
            catch (error) {
                this.logger.error(`❌ [Cleanup] Erro ao remover backup: ${error}`);
            }
        }
        if (toDelete.length > 0) {
            this.logger.log(`✅ [Cleanup] ${toDelete.length} backup(s) antigo(s) removido(s)`);
        }
    }
    async sendNotification(type, backup, errorMessage) {
        try {
            const subject = type === 'success'
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
        }
        catch (error) {
            this.logger.error(`❌ [Backup] Erro ao enviar notificação: ${error}`);
        }
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "handleScheduledBackup", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(backup_entity_1.Backup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        email_service_1.EmailService])
], BackupService);
//# sourceMappingURL=backup.service.js.map