import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PlaceholderService } from '../placeholder/placeholder.service';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { CreateVkPostDto } from './dto/Dto';
import { User } from '../users/user.entity/user.entity';

@Injectable()
export class VkService {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly placeholderService: PlaceholderService, // Внедряем PlaceholderService
    private readonly redisService: RedisService,
  ) {
  }

  async createPostWithAttachments(userId: number, dto: CreateVkPostDto, files: Array<Express.Multer.File>) {
    const user: User | null = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден.`);
    }
    console.log('/////////////////////');
    console.log('user ' + user);
    const { message, groupId } = dto;
    console.log('message ' + message);
    console.log('groupId -' + groupId);
    const accessToken = await this.redisService.get(`vk_access_token:${userId}`);

    if (!accessToken) throw new UnauthorizedException('VK токен не найден');
    console.log('accessToken ' + accessToken);
    const attachments: Array<string> = [];

    // --- ЭТАП А: Загружаем каждое изображение ---
    for (const file of files) {
      // 1. Получаем адрес сервера для загрузки фото
      const getUploadServerUrl = `https://api.vk.ru/method/photos.getWallUploadServer`;
      const uploadServerResponse = await firstValueFrom(
        this.httpService.get(getUploadServerUrl, {
          params: {
            group_id: groupId,
            access_token: accessToken,
            v: '5.199',
          },
        }),
      );
      const uploadUrl = uploadServerResponse.data.response.upload_url;
      console.log('uploadUrl ', uploadUrl);
      // 2. Загружаем фото на полученный адрес
      const formData = new FormData();
      formData.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      const uploadResponse = await firstValueFrom(
        this.httpService.post(uploadUrl, formData, {
          headers: formData.getHeaders(), maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      const { server, photo, hash } = uploadResponse.data;
      console.log('server ', server);
      // 3. Сохраняем фото в VK
      const savePhotoUrl = `https://api.vk.com/method/photos.saveWallPhoto`;
      const savedPhotoResponse = await firstValueFrom(
        this.httpService.post(savePhotoUrl, null, {
          params: {
            group_id: groupId,
            server,
            photo,
            hash,
            access_token: accessToken,
            v: '5.199',
          },
        }),
      );
      const photoData = savedPhotoResponse.data.response[0];
      attachments.push(`photo${photoData.owner_id}_${photoData.id}`);
    }

    // --- ЭТАП Б: Публикуем пост с прикрепленными фото ---
    const postUrl = `https://api.vk.com/method/wall.post`;


    const postData = new URLSearchParams();
    postData.append('owner_id', `-${groupId}`);
    postData.append('from_group', '1');
    postData.append('message', message);
    postData.append('attachments', attachments.join(','));
    postData.append('access_token', accessToken);
    postData.append('v', '5.199');


    const response = await firstValueFrom(this.httpService.post(postUrl, postData));

    if (response.data?.error) {
      throw new Error(`VK Error: ${JSON.stringify(response.data?.error)}`);
    }

    console.log('Response - ' + JSON.stringify(response.data));
    return { message: 'OK' };
  }


  // The old method of posting
  async postToWall(accessToken: string, message: string): Promise<any> {
    const apiUrl = 'https://api.vk.com/method/wall.post';

    const response = await axios.post(apiUrl, null, {
      params: {
        access_token: accessToken,
        v: '5.199',
        message,
        owner_id: '-YOUR_GROUP_ID', // заменишь на свою группу
        from_group: 0,
      },
    });
    console.log('response', response);

    console.log('type of response', typeof response);
    if (response.data.error) {
      throw new Error(`VK Error: ${JSON.stringify(response.data.error)}`);
    }

    return response.data;
  }


}
