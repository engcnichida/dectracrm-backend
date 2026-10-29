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
exports.Payable = exports.PayableStatus = void 0;
const typeorm_1 = require("typeorm");
const recurring_expense_entity_1 = require("./recurring-expense.entity");
const expense_entity_1 = require("./expense.entity");
const contract_entity_1 = require("./contract.entity");
var PayableStatus;
(function (PayableStatus) {
    PayableStatus["PENDENTE"] = "PENDENTE";
    PayableStatus["PAGO"] = "PAGO";
    PayableStatus["CANCELADO"] = "CANCELADO";
    PayableStatus["ATRASADO"] = "ATRASADO";
})(PayableStatus || (exports.PayableStatus = PayableStatus = {}));
let Payable = class Payable {
};
exports.Payable = Payable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300 }),
    __metadata("design:type", String)
], Payable.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Payable.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Payable.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Payable.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: PayableStatus.PENDENTE }),
    __metadata("design:type", String)
], Payable.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "contractId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "recurringExpenseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => recurring_expense_entity_1.RecurringExpense, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'recurringExpenseId' }),
    __metadata("design:type", recurring_expense_entity_1.RecurringExpense)
], Payable.prototype, "recurringExpense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "expenseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => expense_entity_1.Expense, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'expenseId' }),
    __metadata("design:type", expense_entity_1.Expense)
], Payable.prototype, "expense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Payable.prototype, "generatesReceipt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payable.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contract_entity_1.Contract, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'contractId' }),
    __metadata("design:type", contract_entity_1.Contract)
], Payable.prototype, "contract", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payable.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Payable.prototype, "updatedAt", void 0);
exports.Payable = Payable = __decorate([
    (0, typeorm_1.Entity)('payables')
], Payable);
//# sourceMappingURL=payable.entity.js.map