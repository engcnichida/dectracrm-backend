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
exports.CrmController = void 0;
const financial_automation_service_1 = require("../../application/financial/financial-automation.service");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crm_service_1 = require("../../application/crm/crm.service");
const alert_subscriber_service_1 = require("../../application/auth/alert-subscriber.service");
const common_2 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const common_3 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../application/auth/jwt-auth.guard");
function getUserIdFromToken(req, jwtService) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
        throw new common_1.UnauthorizedException('Token de autenticação não fornecido.');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new common_1.UnauthorizedException('Formato de token inválido.');
    }
    try {
        const decoded = jwtService.verify(token);
        return decoded.sub || decoded.id;
    }
    catch (error) {
        throw new common_1.UnauthorizedException('Token inválido ou expirado.');
    }
}
let CrmController = class CrmController {
    constructor(crmService, jwtService, alertSubscriberService, financialAutomationService) {
        this.crmService = crmService;
        this.jwtService = jwtService;
        this.alertSubscriberService = alertSubscriberService;
        this.financialAutomationService = financialAutomationService;
    }
    getBoard() { return this.crmService.getOpportunitiesBoard(); }
    createOpportunity(data) { return this.crmService.createOpportunity(data); }
    updateOpportunity(id, data) { return this.crmService.updateOpportunity(id, data); }
    updateStage(id, stage) { return this.crmService.updateStage(id, stage); }
    deleteOpportunity(id) { return this.crmService.deleteOpportunity(id); }
    findAllCustomers() { return this.crmService.findAllCustomers(); }
    getCustomerMetrics() { return this.crmService.getCustomerMetrics(); }
    getCustomerDetails(id) { return this.crmService.getCustomerDetails(id); }
    createCustomer(data) { return this.crmService.createCustomer(data); }
    updateCustomer(id, data) { return this.crmService.updateCustomer(id, data); }
    deleteCustomer(id) { return this.crmService.deleteCustomer(id); }
    async getCustomerWithContracts(id) {
        return this.crmService.getCustomerWithContracts(id);
    }
    findAllContracts() { return this.crmService.findAllContracts(); }
    createContract(data) {
        return this.crmService.createContract(data);
    }
    updateContract(id, data) { return this.crmService.updateContract(id, data); }
    deleteContract(id) { return this.crmService.deleteContract(id); }
    async archiveOpportunity(id, body) {
        return this.crmService.archiveOpportunity(id, body.reason);
    }
    async getArchivedOpportunities(customerId) {
        return this.crmService.getArchivedOpportunities(customerId);
    }
    findAllReceivables() { return this.crmService.findAllReceivables(); }
    markReceivableAsPaid(id, paidAt) {
        return this.crmService.markReceivableAsPaid(id, paidAt);
    }
    markReceivableAsOpen(id) { return this.crmService.markReceivableAsOpen(id); }
    updateReceivable(id, data) {
        return this.crmService.updateReceivable(id, data);
    }
    deleteReceivable(id) { return this.crmService.deleteReceivable(id); }
    findAllPayables() { return this.crmService.findAllPayables(); }
    createPayable(data) { return this.crmService.createPayable(data); }
    markPayableAsPaid(id, data) { return this.crmService.markPayableAsPaid(id, data); }
    updatePayable(id, data) {
        return this.crmService.updatePayable(id, data);
    }
    deletePayable(id) { return this.crmService.deletePayable(id); }
    getFinancialDashboard() {
        return this.crmService.getFinancialDashboard();
    }
    getContractsPendingReceivables() {
        return this.crmService.getContractsPendingReceivables();
    }
    markContractReceivablesAsOverdue(id) {
        return this.crmService.markContractReceivablesAsOverdue(id);
    }
    getSalesKPIs() {
        return this.crmService.getSalesKPIs();
    }
    getMonthlyFinancialData(months, startDate, endDate) {
        return this.crmService.getMonthlyFinancialData(months ? parseInt(months) : 6, startDate, endDate);
    }
    async exportOpportunitiesCsv(res) {
        try {
            const data = await this.crmService.exportOpportunitiesToCSV();
            const headers = Object.keys(data[0] || {}).join(';');
            const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(';')).join('\r\n');
            const csvContent = `${headers}\r\n${rows}`;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=oportunidades_dectra.csv');
            return res.send('\uFEFF' + csvContent);
        }
        catch (error) {
            console.error('Erro ao exportar CSV:', error);
            return res.status(500).json({ message: 'Erro ao gerar relatório' });
        }
    }
    async markAsPaid(type, id) {
        return this.crmService.markAsPaid(id, type);
    }
    async getAlertSubscribers(req) {
        const adminId = getUserIdFromToken(req, this.jwtService);
        return this.alertSubscriberService.getSubscribers(adminId);
    }
    async addAlertSubscriber(req, data) {
        const adminId = getUserIdFromToken(req, this.jwtService);
        return this.alertSubscriberService.addSubscriber(adminId, data.userId, data.receivePaymentConfirmations, data.receiveDueDateReminders);
    }
    async removeAlertSubscriber(req, id) {
        const adminId = getUserIdFromToken(req, this.jwtService);
        return this.alertSubscriberService.removeSubscriber(adminId, id);
    }
    async testEmailAutomation() {
        return this.financialAutomationService.runManualTest();
    }
    findAllExpenses() { return this.crmService.findAllExpenses(); }
    createExpense(data) { return this.crmService.createExpense(data); }
    updateExpense(id, data) {
        return this.crmService.updateExpense(id, data);
    }
    deleteExpense(id) {
        return this.crmService.deleteExpense(id);
    }
    getExpensesByCategory() { return this.crmService.getExpensesByCategory(); }
    getTotalExpenses(startDate, endDate) {
        return this.crmService.getTotalExpenses(startDate, endDate);
    }
    findAllRecurringExpenses() {
        return this.crmService.findAllRecurringExpenses();
    }
    createRecurringExpense(data) {
        return this.crmService.createRecurringExpense(data);
    }
    updateRecurringExpense(id, data) {
        return this.crmService.updateRecurringExpense(id, data);
    }
    deleteRecurringExpense(id) {
        return this.crmService.deleteRecurringExpense(id);
    }
    generateRecurringPayables() {
        return this.crmService.generateRecurringPayables();
    }
    findAllExpenseTypes() {
        return this.crmService.findAllExpenseTypes();
    }
    createExpenseType(data) {
        return this.crmService.createExpenseType(data);
    }
    updateExpenseType(id, data) {
        return this.crmService.updateExpenseType(id, data);
    }
    deleteExpenseType(id) {
        return this.crmService.deleteExpenseType(id);
    }
    generateExpenseReport(startDate, endDate, classification) {
        return this.crmService.generateExpenseReport(startDate, endDate, classification);
    }
    generatePayablesReport(status, overdueOnly) {
        return this.crmService.generatePayablesReport(status, overdueOnly === 'true');
    }
    generateReceivablesReport(status) {
        return this.crmService.generateReceivablesReport(status);
    }
    generateCashFlowReport(month, year) {
        return this.crmService.generateCashFlowReport(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
    }
    generateContractsReport(status) {
        return this.crmService.generateContractsReport(status);
    }
    getUserPresets(page, userId) {
        return this.crmService.getUserPresets(page, userId);
    }
    createUserPreset(data) {
        return this.crmService.createUserPreset(data);
    }
    deleteUserPreset(id) {
        return this.crmService.deleteUserPreset(id);
    }
    async exportLeads() {
        return this.crmService.exportLeads();
    }
    async importLeads(file) {
        return this.crmService.importLeads(file);
    }
    async searchLeadsOnline(keywords) {
        if (!keywords)
            throw new (require('@nestjs/common').BadRequestException)('Palavras-chave sao obrigatorias');
        return this.crmService.searchLeadsOnline(keywords);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Get)('opportunities/board'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Post)('opportunities'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createOpportunity", null);
__decorate([
    (0, common_1.Put)('opportunities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateOpportunity", null);
__decorate([
    (0, common_1.Patch)('opportunities/:id/stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateStage", null);
__decorate([
    (0, common_1.Delete)('opportunities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteOpportunity", null);
__decorate([
    (0, common_1.Get)('customers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllCustomers", null);
__decorate([
    (0, common_1.Get)('customers/metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getCustomerMetrics", null);
__decorate([
    (0, common_1.Get)('customers/:id/details'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getCustomerDetails", null);
__decorate([
    (0, common_1.Post)('customers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Put)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)('customers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Get)('customers/:id/contracts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getCustomerWithContracts", null);
__decorate([
    (0, common_1.Get)('contracts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllContracts", null);
__decorate([
    (0, common_1.Post)('contracts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createContract", null);
__decorate([
    (0, common_1.Put)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateContract", null);
__decorate([
    (0, common_1.Delete)('contracts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteContract", null);
__decorate([
    (0, common_1.Post)('opportunities/:id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "archiveOpportunity", null);
__decorate([
    (0, common_1.Get)('opportunities/archived'),
    __param(0, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getArchivedOpportunities", null);
__decorate([
    (0, common_1.Get)('receivables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllReceivables", null);
__decorate([
    (0, common_1.Patch)('receivables/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paidAt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "markReceivableAsPaid", null);
__decorate([
    (0, common_1.Patch)('receivables/:id/reopen'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "markReceivableAsOpen", null);
__decorate([
    (0, common_1.Put)('receivables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateReceivable", null);
__decorate([
    (0, common_1.Delete)('receivables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteReceivable", null);
__decorate([
    (0, common_1.Get)('payables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllPayables", null);
__decorate([
    (0, common_1.Post)('payables'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createPayable", null);
__decorate([
    (0, common_1.Patch)('payables/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "markPayableAsPaid", null);
__decorate([
    (0, common_1.Put)('payables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updatePayable", null);
__decorate([
    (0, common_1.Delete)('payables/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deletePayable", null);
__decorate([
    (0, common_1.Get)('financial/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getFinancialDashboard", null);
__decorate([
    (0, common_1.Get)('financial/contracts-pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getContractsPendingReceivables", null);
__decorate([
    (0, common_1.Patch)('financial/contracts/:id/mark-overdue'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "markContractReceivablesAsOverdue", null);
__decorate([
    (0, common_1.Get)('kpis/sales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getSalesKPIs", null);
__decorate([
    (0, common_1.Get)('dashboard/monthly-financial'),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getMonthlyFinancialData", null);
__decorate([
    (0, common_1.Get)('reports/opportunities/csv'),
    (0, common_2.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "exportOpportunitiesCsv", null);
__decorate([
    (0, common_1.Post)('financial/:type/:id/pay'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Get)('admin/alert-subscribers'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getAlertSubscribers", null);
__decorate([
    (0, common_1.Post)('admin/alert-subscribers'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "addAlertSubscriber", null);
__decorate([
    (0, common_1.Delete)('admin/alert-subscribers/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "removeAlertSubscriber", null);
__decorate([
    (0, common_1.Post)('admin/test-email-automation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "testEmailAutomation", null);
__decorate([
    (0, common_1.Get)('expenses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllExpenses", null);
__decorate([
    (0, common_1.Post)('expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Put)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateExpense", null);
__decorate([
    (0, common_1.Delete)('expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteExpense", null);
__decorate([
    (0, common_1.Get)('expenses/by-category'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getExpensesByCategory", null);
__decorate([
    (0, common_1.Get)('expenses/total'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getTotalExpenses", null);
__decorate([
    (0, common_1.Get)('recurring-expenses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllRecurringExpenses", null);
__decorate([
    (0, common_1.Post)('recurring-expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createRecurringExpense", null);
__decorate([
    (0, common_1.Put)('recurring-expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateRecurringExpense", null);
__decorate([
    (0, common_1.Delete)('recurring-expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteRecurringExpense", null);
__decorate([
    (0, common_1.Post)('recurring-expenses/generate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generateRecurringPayables", null);
__decorate([
    (0, common_1.Get)('expense-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "findAllExpenseTypes", null);
__decorate([
    (0, common_1.Post)('expense-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createExpenseType", null);
__decorate([
    (0, common_1.Put)('expense-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateExpenseType", null);
__decorate([
    (0, common_1.Delete)('expense-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteExpenseType", null);
__decorate([
    (0, common_1.Get)('reports/expenses'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('classification')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generateExpenseReport", null);
__decorate([
    (0, common_1.Get)('reports/payables'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('overdueOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generatePayablesReport", null);
__decorate([
    (0, common_1.Get)('reports/receivables'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generateReceivablesReport", null);
__decorate([
    (0, common_1.Get)('reports/cash-flow'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generateCashFlowReport", null);
__decorate([
    (0, common_1.Get)('reports/contracts'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "generateContractsReport", null);
__decorate([
    (0, common_1.Get)('presets'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getUserPresets", null);
__decorate([
    (0, common_1.Post)('presets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createUserPreset", null);
__decorate([
    (0, common_1.Delete)('presets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "deleteUserPreset", null);
__decorate([
    (0, common_1.Get)('opportunities/export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "exportLeads", null);
__decorate([
    (0, common_1.Post)('opportunities/import'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_3.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "importLeads", null);
__decorate([
    (0, common_1.Post)('opportunities/search-online'),
    __param(0, (0, common_1.Body)('keywords')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "searchLeadsOnline", null);
exports.CrmController = CrmController = __decorate([
    (0, common_1.Controller)('crm'),
    __metadata("design:paramtypes", [crm_service_1.CrmService,
        jwt_1.JwtService,
        alert_subscriber_service_1.AlertSubscriberService,
        financial_automation_service_1.FinancialAutomationService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map