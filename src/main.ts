import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './application/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que o frontend (Next.js) se comunique com o backend
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // ⚠️ MUDANÇA CRÍTICA: Especificar '0.0.0.0' para o Render funcionar
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  
  // ✅ Envolve em try-catch para não derrubar o app se falhar
  try {
    const authService = app.get(AuthService);
    await authService.createInitialAdmin();
  } catch (error) {
    console.error('⚠️  Aviso: Erro ao criar admin inicial (pode ser ignorado se o usuário já existir):', error);
  }
  
  console.log(`🚀 Backend DectraCRM rodando em http://0.0.0.0:${port}`);
}
bootstrap();