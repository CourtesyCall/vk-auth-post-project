import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({
  imports: [ConfigModule], // Нам нужен ConfigService для доступа к .env
  providers: [
    {
      provide: REDIS_CLIENT, // 1. Говорим: "Я предоставляю зависимость с токеном REDIS_CLIENT"
      useFactory: (configService: ConfigService) => {
        // 2. useFactory - это инструкция, КАК создать эту зависимость
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is not defined in environment variables');
        }
        // 3. Создаем и возвращаем экземпляр клиента ioredis
        return new Redis(redisUrl);
      },
      inject: [ConfigService], // 4. Указываем, что наша фабрика зависит от ConfigService
    },
    RedisService, // 5. Регистрируем сам RedisService как провайдер
  ],
  exports: [RedisService],
})

export class RedisModule {}


