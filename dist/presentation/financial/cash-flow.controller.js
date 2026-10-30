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
var CashFlowController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowController = void 0;
const common_1 = require("@nestjs/common");
const cash_flow_service_1 = require("../../application/financial/cash-flow.service");
const contract_entity_1 = require("../../domain/contract.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CashFlowController = CashFlowController_1 = class CashFlowController {
    constructor(cashFlowService, contractRepo) {
        this.cashFlowService = cashFlowService;
        this.contractRepo = contractRepo;
        this.logger = new common_1.Logger(CashFlowController_1.name);
    }
    calculateCashFlow(startDate, endDate) {
        return this.cashFlowService.calculateCashFlow(startDate, endDate);
    }
    async importBankStatement(data) {
        this.logger.log('📥 Recebida requisição de importação de extrato bancário');
        return this.cashFlowService.importBankStatement(data);
    }
    updateReceivable(id, data) {
        return this.cashFlowService.updateReceivable(id, data);
    }
    updatePayable(id, data) {
        return this.cashFlowService.updatePayable(id, data);
    }
    async getContracts() {
        const contracts = await this.contractRepo.find();
        return contracts;
    }
    saveForecast(data) {
        return this.cashFlowService.saveForecast(data);
    }
    getForecasts(month, year) {
        return this.cashFlowService.getForecasts(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    deleteReceivable(id) {
        return this.cashFlowService.deleteReceivable(id);
    }
    deletePayable(id) {
        return this.cashFlowService.deletePayable(id);
    }
};
exports.CashFlowController = CashFlowController;
__decorate([
    (0, common_1.Get)('calculate'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "calculateCashFlow", null);
__decorate([
    (0, common_1.Post)('import-bank-statement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "importBankStatement", null);
__decorate([
    (0, common_1.Put)('receivables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "updateReceivable", null);
__decorate([
    (0, common_1.Put)('payables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "updatePayable", null);
__decorate([
    (0, common_1.Get)('contracts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CashFlowController.prototype, "getContracts", null);
__decorate([
    (0, common_1.Post)('forecast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "saveForecast", null);
__decorate([
    (0, common_1.Get)('forecasts/list'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "getForecasts", null);
__decorate([
    (0, common_1.Delete)('receivables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "deleteReceivable", null);
__decorate([
    (0, common_1.Delete)('payables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CashFlowController.prototype, "deletePayable", null);
exports.CashFlowController = CashFlowController = CashFlowController_1 = __decorate([
    (0, common_1.Controller)('cash-flow'),
    __param(1, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __metadata("design:paramtypes", [cash_flow_service_1.CashFlowService,
        typeorm_2.Repository])
], CashFlowController);
//# sourceMappingURL=cash-flow.controller.js.map