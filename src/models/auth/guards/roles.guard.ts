import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, RoleHierarchy } from '../../users/enums/roles.enums';


@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен (можно изменить логику)
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) throw new ForbiddenException('Роль не указана');
    // Проверяем, есть ли у пользователя хотя бы одна из требуемых ролей
    const userRoleValue = RoleHierarchy[user.role];

    const hasAccess = requiredRoles.some((role) => userRoleValue >= RoleHierarchy[role]);

    if (!hasAccess) throw new ForbiddenException('Недостаточно прав доступа');
    return hasAccess;
  }
}