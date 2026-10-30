"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const supplier_entity_1 = require("../../domain/supplier.entity");
const suppliers_service_1 = require("./suppliers.service");
const suppliers_controller_1 = require("./suppliers.controller");
let suppliersModule = class suppliersModule {
};
exports.suppliersModule = suppliersModule;
exports.suppliersModule = suppliersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([supplier_entity_1.Supplier])],
        controllers: [suppliers_controller_1.suppliersController],
        providers: [suppliers_service_1.suppliersService],
        exports: [suppliers_service_1.suppliersService],
    })
], suppliersModule);
//# sourceMappingURL=suppliers.module.js.map