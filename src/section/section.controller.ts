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
  HttpStatus,
  HttpCode, ParseIntPipe,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto, UpdateSectionOrderDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/roles.enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { CopySectionDto } from './dto/copy-section.dto';

@Controller('section')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SectionController {
  private readonly logger = new Logger(SectionController.name);

  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSectionDto: CreateSectionDto) {
    this.logger.log(`Creating a new section with title: ${createSectionDto.title}`);
    return this.sectionService.create(createSectionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    this.logger.log('Fetching all sections');
    return this.sectionService.findAll();
  }

  @Patch('update-order')
  @HttpCode(HttpStatus.OK)
  async updateOrder(@Body() updateOrderDto: UpdateSectionOrderDto) {
    this.logger.log(`Update order with id`);
    return this.sectionService.updateOrder(updateOrderDto.sections);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching section with id: ${id}`);
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSectionDto: UpdateSectionDto) {
    this.logger.log(`Updating section with id: ${id}`);
    return this.sectionService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Removing section with id: ${id}`);
    await this.sectionService.remove(id);
    return { message: `Section with id ${id} successfully deleted.` };
  }

  @Post(':id/copy')
  @HttpCode(HttpStatus.CREATED)
  copy(
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() copySectionDto: CopySectionDto,
  ) {
    this.logger.log(`Copying section ${sectionId} to template ${copySectionDto.targetTemplateId}`);
    return this.sectionService.copy(sectionId, copySectionDto.targetTemplateId);
  }
}
