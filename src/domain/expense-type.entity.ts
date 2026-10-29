import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expense_types')
export class ExpenseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ✅ NOVO: Classificação contábil
  @Column({ type: 'varchar', length: 20, default: 'DESPESA' })
  classification: string; // CUSTO ou DESPESA

  @Column({ type: 'boolean', default: false })
  isCACComponent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}