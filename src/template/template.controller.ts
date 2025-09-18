import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus, ParseIntPipe,
} from '@nestjs/common';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/roles.enums';

@Controller('template')
@UseGuards(JwtAuthGuard, RolesGuard) // <-- ЗАЩИТА: Все эндпоинты защищены
@Roles(Role.ADMIN)
export class TemplateController {

  private readonly logger = new Logger(TemplateController.name);
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTemplateDto: CreateTemplateDto) {
    this.logger.log(`Creating a new template with name: ${createTemplateDto.name}`);
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    this.logger.log('Fetching all templates');
    return this.templateService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching template with id: ${id}`);
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update( @Param('id', ParseIntPipe) id: number, @Body() updateTemplateDto: UpdateTemplateDto) {
    this.logger.log(`Updating template with id: ${id}`);
    return this.templateService.update(+id, updateTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Removing template with id: ${id}`);
    await this.templateService.remove(id);
    return { message: `Template with id ${id} successfully deleted.` };
  }
}
