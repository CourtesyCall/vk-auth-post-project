// src/models/auth/dto/vk-login.dto.ts
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';


export class VkLoginDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  codeVerifier: string;

  // deviceId не используется в твоем текущем auth.service.ts,
  // но мы его принимаем, так как фронтенд его шлет.
  // Можешь убрать, если решишь не использовать его на бэке.
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
