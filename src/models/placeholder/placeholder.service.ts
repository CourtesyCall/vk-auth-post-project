import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePlaceholderDto, UpdateOrderDto, UpdatePlaceholderDto } from './dto/placeholder.dto';
import { PlaceholerEntity } from './placeholer.entity/placeholer.entity';

@Injectable()
export class PlaceholderService {

  constructor(
    @InjectRepository(PlaceholerEntity)
    private readonly placeholderRepo: Repository<PlaceholerEntity>,
    private dataSource: DataSource,
  ) {}

  async create(createPlaceholderDto: CreatePlaceholderDto): Promise<PlaceholerEntity> {
    const maxPlaceholder = await this.placeholderRepo.createQueryBuilder("placeholder")
      .orderBy("placeholder.sortIndex", "DESC")
      .getOne();

    const newSortIndex = maxPlaceholder ? maxPlaceholder.sortIndex + 1 : 1;

    const placeholder = this.placeholderRepo.create({
      ...createPlaceholderDto,
      sortIndex: newSortIndex,
    });

    return this.placeholderRepo.save(placeholder);
  }

  findAll() {
    return this.placeholderRepo.find();
  }

  findOne(id: number) {
    return this.placeholderRepo.findOne({ where: { id } });
  }

  update(id: number, dto: UpdatePlaceholderDto) {
    return this.placeholderRepo.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    const placeholder = await this.placeholderRepo.findOneBy({ id });

    if (!placeholder) {
      throw new NotFoundException(`Placeholder with ID ${id} not found.`);
    }


    await this.placeholderRepo.delete(id);

    const placeholders = await this.placeholderRepo.find({
      order: { sortIndex: 'ASC' }
    });

    for (let i = 0; i < placeholders.length; i++) {
      placeholders[i].sortIndex = i + 1;
      await this.placeholderRepo.save(placeholders[i]);
    }
  }



  /**
   * Обновляет порядок сортировки для списка плейсхолдеров.
   * Выполняется в рамках одной транзакции.
   * @param order
   */
  async updateOrder(order: { id: number; sortIndex: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatePromises = order.map(({ id, sortIndex }) =>
        queryRunner.manager.update(PlaceholerEntity, id, { sortIndex })
      );

      await Promise.all(updatePromises);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      // If any update fails, roll back the entire transaction
      await queryRunner.rollbackTransaction();
      throw err; // Re-throw the error to be handled by NestJS
    } finally {
      // Release the query runner back to the pool
      await queryRunner.release();
    }
  }
}
