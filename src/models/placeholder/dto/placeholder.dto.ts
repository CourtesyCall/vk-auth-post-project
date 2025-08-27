import { IsArray, IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';


export class CreatePlaceholderDto {
  @IsIn(['text', 'checkbox', 'page'])
  type: 'text' | 'checkbox' | 'page';

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  value?: string;
}



class PlaceholderOrderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  sortIndex: number;
}

// Описывает весь массив, который мы ожидаем в теле запроса
export class UpdateOrderDto {
  @IsArray()
  @ValidateNested({ each: true }) // Проверяет каждый элемент массива
  @Type(() => PlaceholderOrderItemDto)
  placeholders: PlaceholderOrderItemDto[];
}
export class UpdatePlaceholderDto extends PartialType(CreatePlaceholderDto) {}