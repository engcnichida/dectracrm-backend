import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './application/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CONFIGURAÇÃO DE CORS BLINDADA (Função de validação direta)
  app.enableCors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://dectracrm-frontend.vercel.app',
        'https://dectracrm-frontend-9zra-one.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
        'https://dectrasys.dectra.co' // Adicionado por segurança
      ];
      
      // Permite requisições sem origem (ex: testes de API, mobile)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'A política de CORS não permite acesso a partir desta origem.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  
  try {
    const authService = app.get(AuthService);
    await authService.createInitialAdmin();
  } catch (error) {
    console.error('⚠️ Aviso: Erro ao criar admin inicial:', error);
  }
  
  console.log(`🚀 Backend DectraCRM rodando em http://0.0.0.0:${port}`);
}
bootstrap();