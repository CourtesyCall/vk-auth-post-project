import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { ConfigService, ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from '../users/user.entity/user.entity';
import { RedisService } from '../../redis/redis.service';
import { Role } from '../users/enums/roles.enums';
import { AuthJwtPayload } from './dto/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService, // Внедряем HttpService
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @Inject(refreshJwtConfig.KEY)private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
  ) {}

  async vkLogin(code: string, codeVerifier: string, deviceId: string): Promise<{ access_token: string , userId: string | number, refreshToken: string}> {
    let vkAccessToken: string | null = null;
    let vkUserId: number | null = null;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('code_verifier', codeVerifier);
    params.append('redirect_uri', this.configService.get<string>('VK_REDIRECT_URI') as string);
    params.append('client_id', this.configService.get<string>('VK_CLIENT_ID') as string);
    params.append('client_secret', this.configService.get<string>('VK_CLIENT_SECRET') as string);
    params.append('device_id', deviceId);



    try {
      // Обмен кода на access_token через VK API
      const vkOAuthUrl = 'https://id.vk.com/oauth2/auth';// Корректный URL для обмена кода


      const vkResponse = await firstValueFrom(
        this.httpService.post(vkOAuthUrl, params, { // Используем POST
              headers:
                {
                  //  Для полной уверенности можно указываем его явно.
                  'Content-Type': 'application/x-www-form-urlencoded',
          },

        })

      );


      // Проверяем ответ от VK - он может быть разным
      if (vkResponse.data.error) {
        console.error('VK OAuth Error:', vkResponse.data.error_description);
        throw new UnauthorizedException(`Ошибка авторизации VK: ${vkResponse.data.error_description}`);
      }

      vkAccessToken = vkResponse.data.access_token;
      vkUserId = vkResponse.data.user_id;
      console.log('VK Access Token:', vkAccessToken);
      console.log("VK user id:", vkUserId);


      // const vkTokenExpiresIn = vkResponse.data.expires_in; // Время жизни токена в секундах

      if (!vkAccessToken || !vkUserId) {
        throw new UnauthorizedException('Не удалось получить access_token или user_id от VK.');
      }




      // Получаем информацию о пользователе VK (этот шаг опционален, если user_id уже есть)
      const vkApiUrl = 'https://api.vk.com/method/users.get';

      const userInfoResponse = await firstValueFrom(
        this.httpService.get(vkApiUrl, {
          params: {
            user_ids: vkUserId,
            fields: 'id,first_name,last_name,photo_200', // id уже есть, но пусть будет
            access_token: vkAccessToken,
            v: '5.199', // Укажи актуальную версию
          },
        })
      );
      console.log("info of vk user response : " +userInfoResponse.data.response?.[0]);

      const vkUserInfo = userInfoResponse.data.response?.[0];
      if (!vkUserInfo) {
        throw new UnauthorizedException('Не удалось получить информацию о пользователе VK.');
      }
      this.logger.debug(`VK user response: ${JSON.stringify(vkResponse.data, null, 2)}`);


      // --- Логика работы с пользователем в БД ---
      let userInDb: User | null = await this.usersService.findByVkId(vkUserInfo.id);
      const adminVkIdsString = this.configService.get<string>('VK_CLIENT_ID_ADMIN') || '';
      // Превращаем строку в массив ID
      const adminVkIds = adminVkIdsString.split(',');

      //const firstAdminVkId = this.configService.get<string>('VK_CLIENT_ID_ADMIN');
      const role: Role = adminVkIds.includes(String(vkUserInfo.id)) ? Role.ADMIN : Role.USER;

      const vkId = String(vkUserInfo.id);                // 1061774942
      const profile = {
        firstName: vkUserInfo.first_name ?? null,
        lastName:  vkUserInfo.last_name ?? null,
        avatar:    vkUserInfo.photo_200 ?? null,
      };
      console.log("role - " + role);
      if (!userInDb) {
        // Создаем пользователя
        userInDb = await this.usersService.createUser({
          vkId,
          ...profile,
          role: Role.USER,
        });
      } else {
        // Обновляем существующего пользователя
        await this.usersService.updateUser(userInDb.id, {
           // ОБНОВЛЯЕМ ТОКЕН
          // vkAccessTokenExpiresAt: expiresAt,
          // Можно обновлять и другие поля: firstName, lastName, avatar...
          firstName: vkUserInfo.first_name,
          lastName: vkUserInfo.last_name,
          avatar: vkUserInfo.photo_200,
          role: role,
        });
        // Перезагружаем данные пользователя после обновления, чтобы иметь актуальный ID для JWT
        userInDb = await this.usersService.findById(userInDb.id);
        if (!userInDb) { // Дополнительная проверка
          throw new UnauthorizedException('Не удалось найти пользователя после обновления.');
        }
      }

      // Создаем УНИКАЛЬНЫЙ ключ для Redis
      // Мы используем префикс "vk_access_token:" для удобства и ID пользователя
      const redisKey : string = `vk_access_token:${userInDb.id}`;

      const expiresIn : number | null = 200;
       // Сохраняем токен VK в Redis по этому уникальному ключу
      await this.redisService.set(redisKey, vkAccessToken, expiresIn);

      console.log(`Токен VK для пользователя ${userInDb.id} сохранен в Redis по ключу: ${redisKey}`);


      // Создаём JWT-токен для НАШЕГО приложения
      //const payload = { id: userInDb.id, role: userInDb.role };// Используем ID из нашей БД
      const payload : AuthJwtPayload = {sub : userInDb.id}
      const jwt = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);

      return {  userId:userInDb.id, access_token: jwt,  refreshToken: refreshToken}; // Возвращаем JWT клиенту

    } catch (error) {
      console.error('Полная ошибка авторизации VK:', error?.response?.data || error?.message || error);
      // Можно добавить проверку типа ошибки axios
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Внутренняя ошибка авторизации через ВКонтакте.');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    const redisKey = `vk_access_token:${userId}`;

    // Удаляем ключ из Redis
    const deletedCount = await this.redisService.del(redisKey);

    if (deletedCount > 0) {
      console.log(`Сессия VK для пользователя ${userId} успешно удалена из Redis.`);
    } else {
      console.log(`Для пользователя ${userId} не найдено активной сессии VK в Redis.`);
    }

    // В будущем здесь можно добавить токен в "черный список", если нужно

    return { message: 'Logout successful' };
  }



  async validateJWtUser(userid: number) {
    const user : User | null = await this.usersService.findById(userid);
    if (!user) throw new UnauthorizedException('User is not found');
    const currentUser = {id: user.id, role: user.role};
    return currentUser;
  }

  refreshToken(userId:number){
      const payload : AuthJwtPayload = {sub : userId};
      const token = this.jwtService.sign(payload);
      return {
        userId: userId,
        access_token: token,
      }
  }
}
