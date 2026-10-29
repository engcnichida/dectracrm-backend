import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Backup } from '../../domain/backup.entity';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { EmailService } from '../../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Backup])],
  controllers: [BackupController],
  providers: [BackupService, EmailService],
  exports: [BackupService],
})
export class BackupModule {}