import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from './contract.entity';

export enum ReceivableStatus {
  PENDENTE = 'PENDENTE',
  RECEBIDO = 'RECEBIDO',
  ATRASADO = 'ATRASADO',
  CANCELADO = 'CANCELADO',
}

@Entity('receivables')
export class Receivable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column( {nullable: true} )
  contractId: string;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;
 
  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ nullable: true })
  category: string; // Ex: "Serviços", "Produtos", "Consultoria"

  @Column({ nullable: true })
  type: string; // Ex: "RECEITA_OPERACIONAL", "RECEITA_FINANCEIRA"

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @Column({ type: 'enum', enum: ReceivableStatus, default: ReceivableStatus.PENDENTE })
  status: ReceivableStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}