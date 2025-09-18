import { PartialType } from '@nestjs/mapped-types';
import { CreateSectionDto } from './create-section.dto';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {}

class SectionOrderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  sortIndex: number;
}

export class UpdateSectionOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionOrderItemDto)
  sections: SectionOrderItemDto[];
}
