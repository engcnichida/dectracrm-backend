import { Response } from 'express';
import { BackupService } from './backup.service';
export declare class BackupController {
    private readonly backupService;
    constructor(backupService: BackupService);
    createBackup(): Promise<import("../../domain/backup.entity").Backup>;
    listBackups(limit?: string): Promise<import("../../domain/backup.entity").Backup[]>;
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
    downloadBackup(id: string, res: Response): Promise<void>;
    deleteBackup(id: string): Promise<{
        success: boolean;
    }>;
}
