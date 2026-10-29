import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Supplier } from './supplier.entity';

export enum ReceiptType {
  PRO_LABORE = 'PRO_LABORE',
  PJ = 'PJ',
  RESSARCIMENTO = 'RESSARCIMENTO',
}

export enum ReceiptStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  type: ReceiptType; // PRO_LABORE, PJ ou RESSARCIMENTO

  @Column({ type: 'varchar', length: 30, unique: true })
  receiptNumber: string; // Ex: REC-2026-0001

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  receiptDate: Date;
  @ManyToOne(() => Supplier, (supplier) => supplier.receipts, { nullable: true })
  supplier?: Supplier;

  @Column({ nullable: true })
  supplierId?: string;
  
  // Dados do recebedor (quem emitiu o recibo)
  @Column({ type: 'varchar', length: 300 })
  issuerName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  issuerDocument: string; // CPF ou CNPJ

  @Column({ type: 'varchar', length: 300, nullable: true })
  issuerAddress: string;

  // Vinculação (opcional)
  @Column({ type: 'varchar', length: 20, nullable: true })
  linkedEntityType: string; // 'CUSTOMER', 'CONTRACT', 'EMPLOYEE'

  @Column({ type: 'uuid', nullable: true })
  linkedEntityId: string;

  @Column({ type: 'varchar', length: 20, default: ReceiptStatus.PENDENTE })
  status: ReceiptStatus;

  // Comprovantes (caminhos dos arquivos)
  @Column({ type: 'simple-json', nullable: true })
  attachments: string[]; // Array de caminhos de arquivos

  @Column({ type: 'text', nullable: true })
  notes: string; // Observações adicionais

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string; // PIX, TED, BOLETO, DINHEIRO, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string; // Cidade/UF do local de emissão
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}