// src/users/dto/update-profile.dto.ts

import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(512)
  avatar?: string;

  // Поле 'role' здесь намеренно отсутствует!
}