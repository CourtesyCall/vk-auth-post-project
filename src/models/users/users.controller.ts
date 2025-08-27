import {
  Body,
  Controller,
  ForbiddenException,
  Get, HttpCode, HttpStatus, Logger,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { UpdateProfileDto } from './dto/UserDto';
import { RequestWithUser } from '../../common/interfaces/userRequest.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SetRoleDto } from './dto/set-role.dto';
import { Role } from './enums/roles.enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}


  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/')
  async getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    this.logger.log(`Listing users p=${p} l=${l}`);
    return this.usersService.getAllUsers();
  }


  @UseGuards(JwtAuthGuard)
   @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Request() req: RequestWithUser) {
    this.logger.log('Getting user: ', req.user.id);
    return this.usersService.findById(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: string) {
    this.logger.log('Getting user by id: ' + id);
    return this.usersService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Patch('me')
  async updateMe(@Request() req: RequestWithUser,@Body() dto: UpdateProfileDto) {
    this.logger.log('Updated user: ', req.user.id);
    return this.usersService.updateUser(req.user.id, dto);
  }


  // Эндпоинт для установки роли пользователю (только для админов)
  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Например: PATCH /users/15/role
  @UseGuards( JwtAuthGuard, RolesGuard) // Защищаем JWT и Ролью
  // Только админ может менять роли
  async setUserRole(
    @Param('id', ParseIntPipe) userId: number, // ID пользователя, которому меняем роль
    @Body() setRoleDto: SetRoleDto, // DTO с новой ролью
    @Request() req: RequestWithUser // Чтобы получить ID текущего админа
  ) {
    this.logger.log(`Set role: actor=${req.user.id} target=${userId} role=${setRoleDto.role}`);


    // запретить админу снимать роль с самого себя
    if (req.user.id === userId && setRoleDto.role !== Role.ADMIN) {
      throw new ForbiddenException('Администратор не может снять роль с самого себя. Смешнявка ты конечно');
    }


    return this.usersService.updateUserRole(userId, setRoleDto.role);
  }
}
