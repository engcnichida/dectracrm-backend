import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recurring_expenses')
export class RecurringExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // ALUGUEL, ENERGIA, INTERNET, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedAmount: number; // Valor estimado (pode variar)

  @Column({ type: 'int' })
  dueDay: number; // Dia do mês (1-31)

  @Column({ type: 'varchar', length: 20, default: 'ATIVO' })
  status: string; // ATIVO, INATIVO

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  lastGenerated: string; // Data do último lançamento gerado

  @CreateDateColumn()
  createdAt: Date;
  
  @Column({ type: 'boolean', default: false })
generatesReceipt: boolean; // Indica se esta despesa deve gerar recibo ao ser paga

  @Column({ type: 'boolean', default: false })
autoConfirmOnDueDate: boolean; // Indica se deve ser paga automaticamente no vencimento

  @UpdateDateColumn()
  updatedAt: Date;
}