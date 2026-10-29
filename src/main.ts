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

  // ✅ MUDANÇA AQUI: Porta padrão alterada de 3000 para 8000
  const port = process.env.PORT || 8000;
  await app.listen(port);
  
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();
  
  console.log(`🚀 Backend DectraCRM rodando em http://localhost:${port}`);
}
bootstrap();