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
var FinancialAutomationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialAutomationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const email_service_1 = require("../../services/email.service");
const alert_subscriber_service_1 = require("../auth/alert-subscriber.service");
let FinancialAutomationService = FinancialAutomationService_1 = class FinancialAutomationService {
    constructor(receivableRepo, payableRepo, emailService, alertSubscriberService) {
        this.receivableRepo = receivableRepo;
        this.payableRepo = payableRepo;
        this.emailService = emailService;
        this.alertSubscriberService = alertSubscriberService;
        this.logger = new common_1.Logger(FinancialAutomationService_1.name);
    }
    async checkUpcomingDueDates() {
        this.logger.log('🕒 Verificando contas com vencimento em 3 dias...');
        const today = new Date();
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + 3);
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
        try {
            const upcomingReceivables = await this.receivableRepo.find({
                where: {
                    dueDate: (0, typeorm_2.Between)(startOfDay, endOfDay),
                    status: 'PENDENTE',
                },
                relations: ['contract', 'contract.customer'],
            });
            for (const rec of upcomingReceivables) {
                const customer = rec.contract?.customer;
                if (customer?.email) {
                    await this.emailService.sendDueDateReminder(customer.email, customer.name || 'Cliente', rec.amount, rec.description || 'Fatura', new Date(rec.dueDate).toLocaleDateString('pt-BR'), 'receber');
                }
            }
            const upcomingPayables = await this.payableRepo.find({
                where: {
                    dueDate: (0, typeorm_2.Between)(startOfDay, endOfDay),
                    status: 'PENDENTE',
                },
                relations: ['supplier'],
            });
            for (const pay of upcomingPayables) {
                if (pay.supplier?.email) {
                    await this.emailService.sendDueDateReminder(pay.supplier.email, pay.supplier.name || 'Fornecedor', pay.amount, pay.description || 'Conta', new Date(pay.dueDate).toLocaleDateString('pt-BR'), 'pagar');
                }
            }
            this.logger.log(`✅ Verificação concluída. ${upcomingReceivables.length} a receber e ${upcomingPayables.length} a pagar notificadas.`);
        }
        catch (error) {
            this.logger.error(`❌ Erro na automação financeira: ${error.message}`, error.stack);
        }
    }
    async runManualTest() {
        this.logger.log('🧪 TESTE MANUAL: Iniciando verificação...');
        await this.checkUpcomingDueDates();
        return {
            message: 'Teste executado. Verifique os logs e sua caixa de e-mail.',
            timestamp: new Date().toISOString()
        };
    }
};
exports.FinancialAutomationService = FinancialAutomationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinancialAutomationService.prototype, "checkUpcomingDueDates", null);
exports.FinancialAutomationService = FinancialAutomationService = FinancialAutomationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(receivable_entity_1.Receivable)),
    __param(1, (0, typeorm_1.InjectRepository)(payable_entity_1.Payable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService,
        alert_subscriber_service_1.AlertSubscriberService])
], FinancialAutomationService);
//# sourceMappingURL=financial-automation.service.js.map