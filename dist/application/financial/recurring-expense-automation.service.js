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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringExpenseAutomationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crm_service_1 = require("../crm/crm.service");
let RecurringExpenseAutomationService = class RecurringExpenseAutomationService {
    constructor(crmService) {
        this.crmService = crmService;
    }
    async handleCron() {
        console.log('⏰ [RecurringExpenseAutomation] Executando geração automática de contas a pagar...');
        try {
            const result = await this.crmService.generateRecurringPayables();
            console.log(`✅ [RecurringExpenseAutomation] ${result.generated} contas a pagar geradas`);
        }
        catch (error) {
            console.error('❌ [RecurringExpenseAutomation] Erro ao gerar contas a pagar:', error);
        }
    }
};
exports.RecurringExpenseAutomationService = RecurringExpenseAutomationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringExpenseAutomationService.prototype, "handleCron", null);
exports.RecurringExpenseAutomationService = RecurringExpenseAutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], RecurringExpenseAutomationService);
//# sourceMappingURL=recurring-expense-automation.service.js.map