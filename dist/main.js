"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./application/auth/auth.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT || 8000;
    await app.listen(port, '0.0.0.0');
    try {
        const authService = app.get(auth_service_1.AuthService);
        await authService.createInitialAdmin();
    }
    catch (error) {
        console.error('⚠️  Aviso: Erro ao criar admin inicial (pode ser ignorado se o usuário já existir):', error);
    }
    console.log(`🚀 Backend DectraCRM rodando em http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map