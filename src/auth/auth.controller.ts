import {
  Body,
  Controller, HttpCode, HttpStatus,
  Post, Req,
  Request,
  UnauthorizedException, UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { VkLoginDto } from './dto/VkLoginDto';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('vkid')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Включаем валидацию DTO
  async vkLogin(
    @Body() vkLoginDto: VkLoginDto, // Получаем тело запроса и валидируем его DTO
  ): Promise<{userId:number|string, access_token: string , refreshToken: string}> {
    try {
      // Передаем code и codeVerifier в сервис
      // deviceId из DTO пока не используется в auth.service.ts
      return await this.authService.vkLogin(vkLoginDto.code, vkLoginDto.codeVerifier, vkLoginDto.deviceId );



    } catch (error) {
      console.error("Ошибка в POST /auth/vkid:", error);
      // AuthService может выбросить UnauthorizedException или другую ошибку
      // Если нужно, можно добавить более специфичную обработку
      throw new UnauthorizedException('Не удалось войти через VK ID.');
    }
  }

  @UseGuards(JwtAuthGuard) // Защищаем этот эндпоинт
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req) {
    // req.user будет содержать payload из JWT, включая id
    return this.authService.logout(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshToken(@Req() req){
      return this.authService.refreshToken(req.user.id);
  }


}