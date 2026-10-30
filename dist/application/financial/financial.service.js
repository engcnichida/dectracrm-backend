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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const receipt_entity_1 = require("../../domain/receipt.entity");
let FinancialService = class FinancialService {
    constructor(receivableRepo, payableRepo, receiptRepo) {
        this.receivableRepo = receivableRepo;
        this.payableRepo = payableRepo;
        this.receiptRepo = receiptRepo;
    }
    async getDashboard() {
        const totalReceivables = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.status = :status', { status: 'RECEBIDO' })
            .getRawOne();
        const totalPayables = await this.payableRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.status = :status', { status: 'PAGO' })
            .getRawOne();
        const pendingReceivables = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.status != :status', { status: 'RECEBIDO' })
            .getRawOne();
        const pendingPayables = await this.payableRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.status != :status', { status: 'PAGO' })
            .getRawOne();
        const totalReceived = Number(totalReceivables?.total || 0);
        const totalPaid = Number(totalPayables?.total || 0);
        return {
            totalReceivables: totalReceived,
            totalReceived,
            totalCosts: 0,
            totalExpenses: totalPaid,
            totalOutflows: totalPaid,
            balance: totalReceived - totalPaid,
            totalPendingReceivables: Number(pendingReceivables?.total || 0),
            totalPendingPayables: Number(pendingPayables?.total || 0),
        };
    }
    async getAdvancedFinancialMetrics() {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        const receivedTotal = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.status = :status', { status: 'RECEBIDO' })
            .getRawOne();
        const paidTotal = await this.payableRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.status = :status', { status: 'PAGO' })
            .getRawOne();
        const currentBalance = Number(receivedTotal?.total || 0) - Number(paidTotal?.total || 0);
        const overdueReceivables = await this.receivableRepo
            .createQueryBuilder('r')
            .select('COUNT(r.id)', 'count')
            .addSelect('SUM(r.amount)', 'total')
            .where('r.dueDate < :today', { today })
            .andWhere('r.status != :status', { status: 'RECEBIDO' })
            .getRawOne();
        const overduePayables = await this.payableRepo
            .createQueryBuilder('p')
            .select('COUNT(p.id)', 'count')
            .addSelect('SUM(p.amount)', 'total')
            .where('p.dueDate < :today', { today })
            .andWhere('p.status != :status', { status: 'PAGO' })
            .getRawOne();
        const projectedIn = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.dueDate BETWEEN :start AND :end', { start: today, end: thirtyDaysFromNow })
            .andWhere('r.status != :status', { status: 'RECEBIDO' })
            .getRawOne();
        const projectedOut = await this.payableRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.dueDate BETWEEN :start AND :end', { start: today, end: thirtyDaysFromNow })
            .andWhere('p.status != :status', { status: 'PAGO' })
            .getRawOne();
        const projectedBalance = currentBalance
            + Number(projectedIn?.total || 0)
            - Number(projectedOut?.total || 0);
        const pendingReceivables = await this.receivableRepo
            .createQueryBuilder('r')
            .select('SUM(r.amount)', 'total')
            .where('r.dueDate >= :today', { today })
            .andWhere('r.status != :status', { status: 'RECEBIDO' })
            .getRawOne();
        const pendingPayables = await this.payableRepo
            .createQueryBuilder('p')
            .select('SUM(p.amount)', 'total')
            .where('p.dueDate >= :today', { today })
            .andWhere('p.status != :status', { status: 'PAGO' })
            .getRawOne();
        return {
            currentBalance,
            overdue: {
                receivables: {
                    count: Number(overdueReceivables?.count || 0),
                    total: Number(overdueReceivables?.total || 0),
                },
                payables: {
                    count: Number(overduePayables?.count || 0),
                    total: Number(overduePayables?.total || 0),
                },
            },
            projection30Days: {
                projectedBalance,
                expectedIn: Number(projectedIn?.total || 0),
                expectedOut: Number(projectedOut?.total || 0),
            },
            pending: {
                receivables: Number(pendingReceivables?.total || 0),
                payables: Number(pendingPayables?.total || 0),
            },
        };
    }
    async getMonthlyFinancialData(filters) {
        return [];
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(receivable_entity_1.Receivable)),
    __param(1, (0, typeorm_1.InjectRepository)(payable_entity_1.Payable)),
    __param(2, (0, typeorm_1.InjectRepository)(receipt_entity_1.Receipt)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialService);
//# sourceMappingURL=financial.service.js.map