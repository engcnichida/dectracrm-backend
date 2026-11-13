import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; 
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // ✅ LOG DE DIAGNÓSTICO: Veja isso no terminal do Render/Local quando o erro 403 ocorrer
    console.log('🔍 [RolesGuard] Verificando permissão. Required:', requiredRoles, '| User no token:', user);

    const hasRole = requiredRoles.some((role) => user?.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso.');
    }

    return true;
  }
}