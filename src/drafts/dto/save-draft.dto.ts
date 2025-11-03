// src/drafts/dto/save-draft.dto.ts

import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class SaveDraftDto {
  @IsObject()
  @IsOptional()
  form_data: Record<string, any>;

  @IsArray()
  @IsString({ each: true }) // Проверяет, что каждый элемент массива - строка
  @IsOptional()
  file_names: string[];
}