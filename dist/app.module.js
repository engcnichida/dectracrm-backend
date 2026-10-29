"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./application/auth/auth.module");
const crm_module_1 = require("./application/crm/crm.module");
const backup_module_1 = require("./application/backup/backup.module");
const receipt_entity_1 = require("./domain/receipt.entity");
const receipts_module_1 = require("./application/receipts/receipts.module");
const cash_flow_module_1 = require("./application/financial/cash-flow.module");
const suppliers_module_1 = require("./application/suppliers/suppliers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USERNAME || 'dectra',
                password: process.env.DB_PASSWORD || 'dectra123',
                database: process.env.DB_DATABASE || 'dectra_crm',
                autoLoadEntities: true,
                synchronize: true,
                retryAttempts: 10,
                retryDelay: 3000,
                extra: {
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 5000,
                },
            }),
            auth_module_1.AuthModule,
            crm_module_1.CrmModule,
            backup_module_1.BackupModule,
            receipts_module_1.ReceiptsModule,
            receipt_entity_1.Receipt,
            schedule_1.ScheduleModule.forRoot(),
            cash_flow_module_1.CashFlowModule,
            suppliers_module_1.SuppliersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map