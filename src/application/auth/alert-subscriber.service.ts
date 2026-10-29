import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertSubscriber } from '../../domain/alert-subscriber.entity';
import { User, UserRole } from '../../domain/user.entity';

@Injectable()
export class AlertSubscriberService {
  constructor(
    @InjectRepository(AlertSubscriber)
    private subscriberRepo: Repository<AlertSubscriber>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Admin: Listar todos os assinantes
  async getSubscribers(adminId: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem gerenciar assinantes.');
    }

    return this.subscriberRepo.find({
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        receivePaymentConfirmations: true,
        receiveDueDateReminders: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  // Admin: Adicionar assinante
  async addSubscriber(adminId: string, userId: string, receivePaymentConfirmations: boolean, receiveDueDateReminders: boolean) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem gerenciar assinantes.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Verifica se já existe
    const existing = await this.subscriberRepo.findOne({ where: { userId } });
    if (existing) {
      existing.receivePaymentConfirmations = receivePaymentConfirmations;
      existing.receiveDueDateReminders = receiveDueDateReminders;
      return this.subscriberRepo.save(existing);
    }

    const subscriber = this.subscriberRepo.create({
      userId,
      receivePaymentConfirmations,
      receiveDueDateReminders,
    });

    return this.subscriberRepo.save(subscriber);
  }

  // Admin: Remover assinante
  async removeSubscriber(adminId: string, subscriberId: string) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (admin?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem gerenciar assinantes.');
    }

    await this.subscriberRepo.delete(subscriberId);
    return { message: 'Assinante removido com sucesso.' };
  }

  // Buscar todos os e-mails que devem receber confirmação de pagamento
  async getPaymentConfirmationRecipients(): Promise<string[]> {
    const admin = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
    const subscribers = await this.subscriberRepo.find({
      where: { receivePaymentConfirmations: true },
      relations: ['user'],
    });

    const emails = new Set<string>();
    
    // Sempre inclui o admin
    if (admin?.email) emails.add(admin.email);
    
    // Adiciona os assinantes
    subscribers.forEach(sub => {
      if (sub.user?.email) emails.add(sub.user.email);
    });

    return Array.from(emails);
  }

  // Buscar todos os e-mails que devem receber lembrete de vencimento
  async getDueDateReminderRecipients(): Promise<string[]> {
    const admin = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
    const subscribers = await this.subscriberRepo.find({
      where: { receiveDueDateReminders: true },
      relations: ['user'],
    });

    const emails = new Set<string>();
    
    if (admin?.email) emails.add(admin.email);
    
    subscribers.forEach(sub => {
      if (sub.user?.email) emails.add(sub.user.email);
    });

    return Array.from(emails);
  }
}