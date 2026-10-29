import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('alert_subscribers')
export class AlertSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: string;

  @Column({ default: true })
  receivePaymentConfirmations: boolean; // Recebe e-mails de confirmação de pagamento

  @Column({ default: true })
  receiveDueDateReminders: boolean; // Recebe lembretes de vencimento

  @CreateDateColumn()
  createdAt: Date;
}