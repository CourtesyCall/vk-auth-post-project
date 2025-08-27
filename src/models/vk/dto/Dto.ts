import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVkPostDto {
  @IsString()
  @IsOptional()
  message: string;

  @IsNotEmpty()
  // Приходит из URL, поэтому будет строкой
  groupId: string;
}