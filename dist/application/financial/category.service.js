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
var CategoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const financial_category_entity_1 = require("../../domain/financial-category.entity");
let CategoryService = CategoryService_1 = class CategoryService {
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
        this.logger = new common_1.Logger(CategoryService_1.name);
    }
    async findAll(type) {
        const where = type ? { type, isActive: true } : { isActive: true };
        return this.categoryRepo.find({ where, order: { name: 'ASC' } });
    }
    async create(data) {
        this.logger.log(` Criando categoria: ${data.name} (${data.type})`);
        const category = this.categoryRepo.create({
            ...data,
            isActive: true,
        });
        return this.categoryRepo.save(category);
    }
    async update(id, data) {
        this.logger.log(`✏️ Atualizando categoria: ${id}`);
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        Object.assign(category, data);
        return this.categoryRepo.save(category);
    }
    async remove(id) {
        this.logger.log(`️ Removendo categoria: ${id}`);
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        category.isActive = false;
        return this.categoryRepo.save(category);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = CategoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_category_entity_1.FinancialCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map