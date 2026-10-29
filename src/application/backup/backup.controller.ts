import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { BackupService } from './backup.service';

@Controller('admin/backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  async createBackup() {
    return this.backupService.createBackup('admin-user', 'manual');
  }

  @Get()
  async listBackups(@Query('limit') limit?: string) {
    return this.backupService.listBackups(limit ? parseInt(limit) : 50);
  }

  @Get('stats')
  async getStats() {
    return this.backupService.getStats();
  }

  @Get(':id/download')
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const backup = await this.backupService.getBackupById(id);
    if (!backup || backup.status !== 'SUCCESS') {
      throw new NotFoundException('Backup não encontrado ou inválido');
    }

    if (!fs.existsSync(backup.filepath)) {
      throw new NotFoundException('Arquivo de backup não existe mais no servidor');
    }

    const filename = path.basename(backup.filepath);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    const fileStream = fs.createReadStream(backup.filepath);
    fileStream.pipe(res);
  }

  @Delete(':id')
  async deleteBackup(@Param('id') id: string) {
    return this.backupService.deleteBackup(id);
  }
}