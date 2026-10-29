import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CustomerStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  IMPLANTACAO = 'IMPLANTACAO',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300, nullable: true })
  name: string;

  @Column({ length: 300, nullable: true })
  companyName: string;

  @Column({ length: 18, nullable: true })
  cnpj: string;

  @Column({ length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ length: 9, nullable: true })
  cep: string;

  @Column({ length: 200, nullable: true })
  contactName: string;

  @Column({ length: 50, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ATIVO })
  status: CustomerStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}