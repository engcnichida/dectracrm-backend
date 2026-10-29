import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserStatus {
  PENDENTE = 'PENDENTE',
  ATIVO = 'ATIVO',
  BLOQUEADO = 'BLOQUEADO',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  VENDEDOR = 'VENDEDOR',
  FINANCEIRO = 'FINANCEIRO',
  OPERACIONAL = 'OPERACIONAL',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OPERACIONAL })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDENTE })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, { view: boolean; edit: boolean }>;

  @Column({ nullable: true })
  approvalCode: string;

  @Column({ type: 'timestamp', nullable: true })
  approvalCodeExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}