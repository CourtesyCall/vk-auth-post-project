import { IsInt } from 'class-validator';

export class CopySectionDto {
  @IsInt()
  targetTemplateId: number;
}