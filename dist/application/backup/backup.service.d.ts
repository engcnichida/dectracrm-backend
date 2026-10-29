import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Backup } from '../../domain/backup.entity';
import { EmailService } from '../../services/email.service';
export declare class BackupService {
    private readonly backupRepo;
    private readonly configService;
    private readonly emailService;
    private readonly logger;
    private readonly backupDir;
    private readonly retentionDays;
    private readonly isEnabled;
    private readonly compress;
    private readonly notifyEmail;
    private isRunning;
    constructor(backupRepo: Repository<Backup>, configService: ConfigService, emailService: EmailService);
    handleScheduledBackup(): Promise<void>;
    createBackup(triggeredBy?: string, type?: 'manual' | 'automatic'): Promise<Backup>;
    listBackups(limit?: number): Promise<Backup[]>;
    getBackupById(id: string): Promise<Backup | null>;
    deleteBackup(id: string): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        totalBackups: number;
        successfulBackups: number;
        failedBackups: number;
        totalSizeBytes: number;
        totalSizeMB: string;
        lastBackupAt: Date;
        lastBackupStatus: string;
        isRunning: boolean;
    }>;
    private cleanupOldBackups;
    private sendNotification;
}
