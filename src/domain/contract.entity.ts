import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';

// ⚠️ Verifique se o caminho está correto para a sua entidade de Cliente
import { Customer } from './customer.entity'; 

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ TORNADO NULÁVEL PARA COMPATIBILIZAR COM REGISTROS EXISTENTES
  @Column({ nullable: true })
  customerId: string;

  // ✅ RELAÇÃO EXPLÍCITA COM O CLIENTE (TAMBÉM NULÁVEL)
  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  billingDate: Date;

  @Column({ length: 50, default: 'ATIVO' })
  status: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  installments: number;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'MENSAL' })
  frequency: string;

  @Column({ length: 50, nullable: true })
  paymentCondition: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}