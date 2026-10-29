import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (module: string, action: 'view' | 'edit') =>
  SetMetadata(PERMISSIONS_KEY, { module, action });

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{ module: string; action: 'view' | 'edit' }>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) return true;

    const { user } = context.switchToHttp().getRequest();
    
    // Admin tem acesso total
    if (user?.role === 'ADMIN') return true;

    const permission = user?.permissions?.[required.module];
    
    if (!permission || !permission[required.action]) {
      throw new ForbiddenException(`Você não tem permissão para ${required.action === 'view' ? 'visualizar' : 'modificar'} este módulo.`);
    }

    return true;
  }
}