"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const receipts_module_1 = require("../receipts/receipts.module");
const crm_controller_1 = require("../../presentation/crm/crm.controller");
const crm_service_1 = require("./crm.service");
const alert_subscriber_service_1 = require("../auth/alert-subscriber.service");
const email_service_1 = require("../../services/email.service");
const financial_automation_service_1 = require("../financial/financial-automation.service");
const recurring_expense_automation_service_1 = require("../financial/recurring-expense-automation.service");
const user_preset_entity_1 = require("../../domain/user-preset.entity");
const customer_entity_1 = require("../../domain/customer.entity");
const opportunity_entity_1 = require("../../domain/opportunity.entity");
const contract_entity_1 = require("../../domain/contract.entity");
const receivable_entity_1 = require("../../domain/receivable.entity");
const payable_entity_1 = require("../../domain/payable.entity");
const payable_category_entity_1 = require("../../domain/payable-category.entity");
const supplier_entity_1 = require("../../domain/supplier.entity");
const user_entity_1 = require("../../domain/user.entity");
const alert_subscriber_entity_1 = require("../../domain/alert-subscriber.entity");
const expense_entity_1 = require("../../domain/expense.entity");
const expense_type_entity_1 = require("../../domain/expense-type.entity");
const recurring_expense_entity_1 = require("../../domain/recurring-expense.entity");
const cash_flow_forecast_entity_1 = require("../../domain/cash-flow-forecast.entity");
let CrmModule = class CrmModule {
};
exports.CrmModule = CrmModule;
exports.CrmModule = CrmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_entity_1.Customer,
                opportunity_entity_1.Opportunity,
                contract_entity_1.Contract,
                receivable_entity_1.Receivable,
                payable_entity_1.Payable,
                payable_category_entity_1.PayableCategory,
                supplier_entity_1.Supplier,
                user_entity_1.User,
                alert_subscriber_entity_1.AlertSubscriber,
                expense_entity_1.Expense,
                expense_type_entity_1.ExpenseType,
                recurring_expense_entity_1.RecurringExpense,
                cash_flow_forecast_entity_1.CashFlowForecast,
                user_preset_entity_1.UserPreset,
            ]),
            receipts_module_1.ReceiptsModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'dectra-secret-key-change-in-production',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [crm_controller_1.CrmController],
        providers: [
            crm_service_1.CrmService,
            alert_subscriber_service_1.AlertSubscriberService,
            email_service_1.EmailService,
            financial_automation_service_1.FinancialAutomationService,
            recurring_expense_automation_service_1.RecurringExpenseAutomationService,
        ],
        exports: [crm_service_1.CrmService],
    })
], CrmModule);
//# sourceMappingURL=crm.module.js.map