"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cash_flow_controller_1 = require("../../presentation/financial/cash-flow.controller");
const cash_flow_service_1 = require("./cash-flow.service");
const category_controller_1 = require("../../presentation/financial/category.controller");
const category_service_1 = require("./category.service");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const expense_entity_1 = require("../../domain/expense.entity");
const contract_entity_1 = require("../../domain/contract.entity");
const recurring_expense_entity_1 = require("../../domain/recurring-expense.entity");
const cash_flow_forecast_entity_1 = require("../../domain/cash-flow-forecast.entity");
const financial_category_entity_1 = require("../../domain/financial-category.entity");
let CashFlowModule = class CashFlowModule {
};
exports.CashFlowModule = CashFlowModule;
exports.CashFlowModule = CashFlowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                receivable_entity_1.Receivable,
                payable_entity_1.Payable,
                expense_entity_1.Expense,
                contract_entity_1.Contract,
                recurring_expense_entity_1.RecurringExpense,
                cash_flow_forecast_entity_1.CashFlowForecast,
                financial_category_entity_1.FinancialCategory,
            ]),
        ],
        controllers: [cash_flow_controller_1.CashFlowController, category_controller_1.CategoryController],
        providers: [cash_flow_service_1.CashFlowService, category_service_1.CategoryService],
        exports: [cash_flow_service_1.CashFlowService, category_service_1.CategoryService],
    })
], CashFlowModule);
//# sourceMappingURL=cash-flow.module.js.map