"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertSubscriberService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alert_subscriber_entity_1 = require("../../domain/alert-subscriber.entity");
const user_entity_1 = require("../../domain/user.entity");
let AlertSubscriberService = class AlertSubscriberService {
    constructor(subscriberRepo, userRepo) {
        this.subscriberRepo = subscriberRepo;
        this.userRepo = userRepo;
    }
    async getSubscribers(adminId) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem gerenciar assinantes.');
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
    async addSubscriber(adminId, userId, receivePaymentConfirmations, receiveDueDateReminders) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem gerenciar assinantes.');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
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
    async removeSubscriber(adminId, subscriberId) {
        const admin = await this.userRepo.findOne({ where: { id: adminId } });
        if (admin?.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Apenas administradores podem gerenciar assinantes.');
        }
        await this.subscriberRepo.delete(subscriberId);
        return { message: 'Assinante removido com sucesso.' };
    }
    async getPaymentConfirmationRecipients() {
        const admin = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.ADMIN } });
        const subscribers = await this.subscriberRepo.find({
            where: { receivePaymentConfirmations: true },
            relations: ['user'],
        });
        const emails = new Set();
        if (admin?.email)
            emails.add(admin.email);
        subscribers.forEach(sub => {
            if (sub.user?.email)
                emails.add(sub.user.email);
        });
        return Array.from(emails);
    }
    async getDueDateReminderRecipients() {
        const admin = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.ADMIN } });
        const subscribers = await this.subscriberRepo.find({
            where: { receiveDueDateReminders: true },
            relations: ['user'],
        });
        const emails = new Set();
        if (admin?.email)
            emails.add(admin.email);
        subscribers.forEach(sub => {
            if (sub.user?.email)
                emails.add(sub.user.email);
        });
        return Array.from(emails);
    }
};
exports.AlertSubscriberService = AlertSubscriberService;
exports.AlertSubscriberService = AlertSubscriberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alert_subscriber_entity_1.AlertSubscriber)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AlertSubscriberService);
//# sourceMappingURL=alert-subscriber.service.js.map