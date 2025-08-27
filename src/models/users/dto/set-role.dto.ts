import { IsString, IsIn } from 'class-validator';
import { Role } from '../enums/roles.enums';

export class SetRoleDto {
  @IsString()
  @IsIn([Role.USER,Role.ADMIN ]) // Ограничиваем возможные роли
  role: Role;
}