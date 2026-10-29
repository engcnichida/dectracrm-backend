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
var SuppliersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const supplier_entity_1 = require("../../domain/supplier.entity");
let SuppliersService = SuppliersService_1 = class SuppliersService {
    constructor(supplierRepo) {
        this.supplierRepo = supplierRepo;
        this.logger = new common_1.Logger(SuppliersService_1.name);
    }
    async findAll() {
        return this.supplierRepo.find({
            where: { active: true },
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const supplier = await this.supplierRepo.findOne({ where: { id } });
        if (!supplier)
            throw new common_1.NotFoundException('Prestador não encontrado');
        return supplier;
    }
    async create(data) {
        const supplier = this.supplierRepo.create(data);
        const saved = await this.supplierRepo.save(supplier);
        this.logger.log(`✅ Prestador criado: ${saved.name}`);
        return saved;
    }
    async update(id, data) {
        const supplier = await this.findOne(id);
        Object.assign(supplier, data);
        return this.supplierRepo.save(supplier);
    }
    async remove(id) {
        const supplier = await this.findOne(id);
        supplier.active = false;
        return this.supplierRepo.save(supplier);
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = SuppliersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(supplier_entity_1.Supplier)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map