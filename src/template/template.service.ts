import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemplateService {

  constructor(
    @InjectRepository(Template)
    private readonly TemplateRepository: Repository<Template>,
  ) {
  }



  create(createTemplateDto: CreateTemplateDto) {
    const newTemplate = this.TemplateRepository.create(createTemplateDto);
    return this.TemplateRepository.save(newTemplate);
  }

  findAll(): Promise<Template[]> {
    // Загружаем шаблоны вместе со связанными разделами и плейсхолдерами
    return this.TemplateRepository.find({
      relations: {
        sections: {
          placeholders: true, // Включаем вложенные плейсхолдеры
        },
      },
      order: { id: 'ASC' }, // Сортируем по ID для стабильного порядка
    });

  }

  async findOne(id: number) {
    const template = await this.TemplateRepository.findOne({
      where: { id },
      relations: {
        sections: {
          placeholders: true,
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Шаблон с ID ${id} не найден.`);
    }
    return template;
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto): Promise<Template> {
    // Сначала проверяем, существует ли шаблон
    const template = await this.findOne(id);

    // Обновляем данные
    await this.TemplateRepository.update(id, updateTemplateDto);

    // Возвращаем обновленный объект
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Используем delete, так как { onDelete: 'CASCADE' } в entity
    // позаботится об удалении всех связанных разделов и плейсхолдеров
    const result = await this.TemplateRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Шаблон с ID ${id} не найден.`);
    }
  }
}
