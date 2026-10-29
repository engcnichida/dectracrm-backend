import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  filepath: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({ type: 'varchar', length: 20, default: 'manual' })
  type: string; // 'manual' | 'automatic'

  @Column({ type: 'varchar', length: 20, default: 'SUCCESS' })
  status: string; // 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  triggeredBy: string; // 'system' | 'user:email'

  @CreateDateColumn()
  createdAt: Date;
}