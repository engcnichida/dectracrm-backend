import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExpenseType } from './expense-type.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @ManyToOne(() => ExpenseType, { eager: true })
  @JoinColumn({ name: 'expenseTypeId' })
  expenseType: ExpenseType;

  @Column({ type: 'uuid', nullable: true })
  expenseTypeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  expenseDate: string; // Data da despesa (quando foi gerada)

  @Column({ type: 'date', nullable: true })
  dueDate: string; // Data de vencimento (para conta a pagar)

  @Column({ type: 'varchar', length: 20, default: 'PENDENTE' })
  status: string; // PENDENTE, PAGO, CANCELADO

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Campos de Recorrência
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurrencePeriod: string; // MONTHLY, QUARTERLY, YEARLY

  @Column({ type: 'int', nullable: true })
  recurrenceCount: number; // Quantidade de ocorrências (null = infinito)

  @Column({ type: 'date', nullable: true })
  recurrenceEndDate: string; // Data final da recorrência (opcional)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
generatesReceipt: boolean; // Indica se esta despesa deve gerar recibo ao ser paga

  @Column({ type: 'boolean', default: false })
autoConfirmOnDueDate: boolean; // Indica se deve ser paga automaticamente no vencimento

  @UpdateDateColumn()
  updatedAt: Date;
}