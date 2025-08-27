import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreatePlaceholderDto, UpdatePlaceholderDto } from './dto/placeholder.dto';
import { PlaceholderService } from './placeholder.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../users/enums/roles.enums';

@Controller('placeholder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PlaceholderController {
  constructor(private readonly placeholdersService: PlaceholderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreatePlaceholderDto) {
    return this.placeholdersService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.USER, Role.ADMIN)
  findAll() {
    return this.placeholdersService.findAll();
  }

  @Patch('update-order')
  @HttpCode(HttpStatus.OK)
  async updateOrder(@Body() body: { placeholders: { id: number; sortIndex: number }[] }) {
    return this.placeholdersService.updateOrder(body.placeholders);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.placeholdersService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdatePlaceholderDto) {
    return this.placeholdersService.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: number) {
    await this.placeholdersService.remove(id);
    return { message: 'Placeholder successfully deleted.' };
  }
}
