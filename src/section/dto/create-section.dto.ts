import { IsBoolean, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  isTitleVisible: boolean;

  @IsBoolean()
  isCollapsedByDefault: boolean;

  @IsInt()
  templateId: number;
}
