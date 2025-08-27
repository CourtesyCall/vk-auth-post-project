import {
  BadRequestException,
  Body,
  Controller,
  Param, ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  Request,
  ValidationPipe, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { VkService } from './vk.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateVkPostDto } from './dto/Dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '../../common/interfaces/userRequest.interface';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/roles.enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('vk')
@UseGuards(JwtAuthGuard,RolesGuard)// ЗАЩИЩАЕМ все эндпоинты в контроллере JWT
export class VkController {
  constructor(private readonly vkService: VkService) {}

  @Post('post')
  @Roles(Role.USER)
  async postToVk(@Body() body: { accessToken: string; message: string }) {
    if (!body.accessToken || !body.message) {
      throw new BadRequestException('accessToken и message обязательны');
    }

    const result = await this.vkService.postToWall(body.accessToken, body.message);
    return { success: true, result };
  }

  @Roles(Role.USER)
  @Post('post/mutated')
  // Указываем, что мы ожидаем до 10 файлов в поле 'attachments'
  @UseInterceptors(FilesInterceptor('attachments', 10, {
    storage: memoryStorage()
  }))
  createPost(
    @Request() req: RequestWithUser,
    @Body(new ValidationPipe()) createPostDto: CreateVkPostDto,
    // Получаем загруженные файлы
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    // Передаем все данные в сервис
    return this.vkService.createPostWithAttachments(req.user.id, createPostDto, files);
  }
}
