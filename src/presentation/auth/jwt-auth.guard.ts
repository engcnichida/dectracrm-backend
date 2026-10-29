import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    console.log('🛡️ [JwtAuthGuard] Rota acessada:', request.url);
    console.log('🛡️ [JwtAuthGuard] Cabeçalho recebido:', authHeader);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('❌ [JwtAuthGuard] REJEITADO! Motivo:', info?.message || err?.message || 'Desconhecido');
      throw err || new UnauthorizedException(info?.message || 'Token inválido ou ausente');
    }
    
    console.log('✅ [JwtAuthGuard] Sucesso! Usuário autenticado:', user.email || user.sub);
    return user;
  }
}