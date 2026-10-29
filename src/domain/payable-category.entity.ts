import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payable_categories')
export class PayableCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  color: string;
}