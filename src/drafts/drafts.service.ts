import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Draft } from './entities/draft.entity';
import { Repository } from 'typeorm';
import { SaveDraftDto } from './dto/save-draft.dto';

@Injectable()
export class DraftsService {
  constructor(
    @InjectRepository(Draft)
    private readonly draftsRepository: Repository<Draft>,
  ) {}


  /**
   * Сохраняет (или обновляет) черновик.
   */
  async saveDraft(
    userId: number,
    templateId: number,
    saveDraftDto: SaveDraftDto,
  ): Promise<Draft> {

    // upsert - идеальная команда для "сохранить или обновить"
    // Она найдет запись по 'conflictPaths' и обновит ее,
    // или создаст новую, если не найдет.
    const result = await this.draftsRepository.upsert(
      {
        user: { id: userId },         // Связь по ID
        template: { id: templateId }, // Связь по ID
        form_data: saveDraftDto.form_data,
        file_names: saveDraftDto.file_names,
      },
      // Указываем, по каким колонкам искать конфликт (дубликат)
      ['user', 'template'],
    );

    // upsert возвращает ID, поэтому делаем доп. запрос, чтобы вернуть DTO
    // Это гарантирует, что мы вернем актуальные данные
    const draftId = result.identifiers[0].id;
    const draft = await this.draftsRepository.findOne({ where: { id: draftId } });
    if (!draft) throw new NotFoundException(`Ошибка сохранения: Черновик ${draftId} не найден`);
    return draft;




  }

  /**
   * Находит один черновик.
   */
  async getDraft(userId: number, templateId: number): Promise<Draft> {
    const draft = await this.draftsRepository.findOne({
      where: {
        user: { id: userId },
        template: { id: templateId },
      },
    });

    if (!draft) {
      throw new NotFoundException('Черновик не найден');
    }
    return draft;
  }

  /**
   * Удаляет черновик.
   */
  async deleteDraft(userId: number, templateId: number): Promise<void> {
    const result = await this.draftsRepository.delete({
      user: { id: userId },
      template: { id: templateId },
    });

    if (result.affected === 0) {
      // фронтенд должен знать, что ничего не удалилось - 404
      throw new NotFoundException('Черновик не найден');
    }
  }

}
