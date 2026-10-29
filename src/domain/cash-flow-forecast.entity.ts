import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Expense } from './expense.entity';

@Entity('cash_flow_forecasts')
export class CashFlowForecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // DESPESA, RECEITA

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  forecastDate: string; // Data prevista (mês/ano)

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number; // 2026, 2027, etc.

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @ManyToOne(() => Expense, { nullable: true })
  @JoinColumn({ name: 'expenseId' })
  expense: Expense;

  @Column({ type: 'uuid', nullable: true })
  expenseId: string;

  @Column({ type: 'varchar', length: 20, default: 'PREVISTO' })
  status: string; // PREVISTO, CONFIRMADO, CANCELADO

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}