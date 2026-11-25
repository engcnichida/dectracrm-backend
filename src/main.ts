import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CONFIGURAÇÃO DE CORS SIMPLES E DIRETA (SEM FUNÇÃO PERSONALIZADA)
  app.enableCors({
    origin: [
      'https://dectracrm-frontend.vercel.app',
      'https://dectracrm-frontend-9zra-one.vercel.app',
      'https://dectracrm-frontend-9zra-nxbpzsmyl-dectra.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://dectrasys.dectra.co',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend DectraCRM rodando em http://0.0.0.0:${port}`);
}

bootstrap();