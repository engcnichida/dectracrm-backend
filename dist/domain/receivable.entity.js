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
exports.Receivable = exports.ReceivableStatus = void 0;
const typeorm_1 = require("typeorm");
const contract_entity_1 = require("./contract.entity");
var ReceivableStatus;
(function (ReceivableStatus) {
    ReceivableStatus["PENDENTE"] = "PENDENTE";
    ReceivableStatus["RECEBIDO"] = "RECEBIDO";
    ReceivableStatus["ATRASADO"] = "ATRASADO";
    ReceivableStatus["CANCELADO"] = "CANCELADO";
})(ReceivableStatus || (exports.ReceivableStatus = ReceivableStatus = {}));
let Receivable = class Receivable {
};
exports.Receivable = Receivable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Receivable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Receivable.prototype, "contractId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contract_entity_1.Contract, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'contractId' }),
    __metadata("design:type", contract_entity_1.Contract)
], Receivable.prototype, "contract", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Receivable.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Receivable.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Receivable.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Receivable.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Receivable.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Receivable.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Receivable.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReceivableStatus, default: ReceivableStatus.PENDENTE }),
    __metadata("design:type", String)
], Receivable.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Receivable.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Receivable.prototype, "updatedAt", void 0);
exports.Receivable = Receivable = __decorate([
    (0, typeorm_1.Entity)('receivables')
], Receivable);
//# sourceMappingURL=receivable.entity.js.map