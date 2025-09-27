import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { DataSource, Repository } from 'typeorm';
import { Template } from '../template/entities/template.entity';
import { PlaceholderEntity } from '../placeholder/placeholer.entity/placeholderEntity';

@Injectable()
export class SectionService {

  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    private readonly dataSource: DataSource
  ) {}

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    const { templateId, ...restDto } = createSectionDto;

    // Находим родительский шаблон
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
      relations: ['sections']
    });

    if (!template) {
      throw new NotFoundException(`Шаблон с ID ${templateId} не найден.`);
    }

    const newSortIndex = template.sections.length;

    // Создаем новый раздел и привязываем его к шаблону
    const newSection = this.sectionRepository.create({
      ...restDto,
      sortIndex: newSortIndex,
      templates: [template],
    });

    return this.sectionRepository.save(newSection);
  }

  findAll() {
    // Обычно разделы получают в контексте шаблона, но для админки можно и так
    return this.sectionRepository.find({ relations: ['templates'] });
  }

  async findOne(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['templates', 'placeholders'] // Загружаем связанные сущности
    });
    if (!section) {
      throw new NotFoundException(`Раздел с ID ${id} не найден.`);
    }
    return section;
  }

  async update(id: number, updateSectionDto: UpdateSectionDto): Promise<Section> {
    // При обновлении мы не меняем шаблон, поэтому логика проще
    await this.findOne(id); // Проверяем, что раздел существует

    // Удаляем templateId из DTO, чтобы случайно его не изменить
    const { templateId, ...restDto } = updateSectionDto;

    await this.sectionRepository.update(id, restDto);
    return this.findOne(id); // Возвращаем обновленный раздел
  }

  async remove(id: number): Promise<void> {
    // 1. Находим секцию вместе со всеми связанными шаблонами.
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['templates'],
    });

    if (!section) {
      throw new NotFoundException(`Раздел с ID ${id} не найден.`);
    }

    // 2. "Отвязываем" секцию от всех шаблонов.
    // Это заставит TypeORM удалить записи из связующей таблицы template_sections_section.
    section.templates = [];
    await this.sectionRepository.save(section);

    // 3. Теперь, когда связи удалены, безопасно удаляем саму секцию.
    const result = await this.sectionRepository.delete(id);
    if (result.affected === 0) {
      // Эта проверка на всякий случай, хотя после findOne она вряд ли понадобится.
      throw new NotFoundException(`Раздел с ID ${id} снова не найден после очистки связей.`);
    }
  }


  async copy(sectionId: number, targetTemplateId: number): Promise<Section> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Находим оригинальную секцию со всеми плейсхолдерами
      const originalSection = await queryRunner.manager.findOne(Section, {
        where: { id: sectionId },
        relations: ['placeholders'],
      });
      if (!originalSection) {
        throw new NotFoundException(`Секция с ID ${sectionId} не найдена.`);
      }

      // 2. Находим целевой шаблон
      const targetTemplate = await queryRunner.manager.findOneBy(Template, {
        id: targetTemplateId,
      });
      if (!targetTemplate) {
        throw new NotFoundException(`Целевой шаблон с ID ${targetTemplateId} не найден.`);
      }

      // 3. Создаём копию секции (без id и плейсхолдеров)
      const newSection = queryRunner.manager.create(Section, {
        title: originalSection.title,
        isTitleVisible: originalSection.isTitleVisible,
        isCollapsedByDefault: originalSection.isCollapsedByDefault,
        templates: [targetTemplate], // Привязываем к новому шаблону
      });
      await queryRunner.manager.save(newSection);

      // 4. Копируем все плейсхолдеры
      if (originalSection.placeholders && originalSection.placeholders.length > 0) {
        const newPlaceholders = originalSection.placeholders.map(p => {
          return queryRunner.manager.create(PlaceholderEntity, {
            ...p,
            id: undefined, // Сбрасываем ID, чтобы создать новую запись
            section: newSection, // Привязываем к новой секции
          });
        });
        await queryRunner.manager.save(newPlaceholders);
      }

      // 5. Фиксируем все изменения в базе
      await queryRunner.commitTransaction();

      // 6. Возвращаем полную новую секцию
      return this.findOne(newSection.id);

    } catch (error) {
      // Если что-то пошло не так, отменяем все изменения
      await queryRunner.rollbackTransaction();
      throw error; // Передаем ошибку дальше
    } finally {
      // Всегда освобождаем queryRunner
      await queryRunner.release();
    }
  }

  async updateOrder(order: {id: number; sortIndex: number}[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatePromises = order.map(({id, sortIndex}) =>
        queryRunner.manager.update(Section,id,{sortIndex})
      );

      await Promise.all(updatePromises);
      await queryRunner.commitTransaction();
      return {success: true};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
