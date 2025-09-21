import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';


export class CreatePlaceholderDto {
  @IsInt()
  sectionId: number;

  @IsIn(['text', 'checkbox', 'page', 'select'])
  type: 'text' | 'checkbox' | 'page' | 'select';

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  isMultiChoice?: boolean;
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