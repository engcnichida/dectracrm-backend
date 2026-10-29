import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { RecurringExpense } from './recurring-expense.entity';
import { Expense } from './expense.entity';
import { Contract } from './contract.entity';

export enum PayableStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
  ATRASADO = 'ATRASADO',
}

@Entity('payables')
export class Payable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 20, default: PayableStatus.PENDENTE })
  status: PayableStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  contractId: string;

  // ==========================================
  // RELAÇÕES E CAMPOS DE AUTOMAÇÃO
  // ==========================================

  @Column({ type: 'uuid', nullable: true })
  recurringExpenseId: string;

  @ManyToOne(() => RecurringExpense, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recurringExpenseId' })
  recurringExpense: RecurringExpense;

  @Column({ type: 'uuid', nullable: true })
  expenseId: string;

  @ManyToOne(() => Expense, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'expenseId' })
  expense: Expense;

  @Column({ type: 'boolean', default: false })
  generatesReceipt: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @Column({ nullable: true })
  type: string; // Ex: "DESPESA_OPERACIONAL", "DESPESA_ADMINISTRATIVA"

  @UpdateDateColumn()
  updatedAt: Date;
}