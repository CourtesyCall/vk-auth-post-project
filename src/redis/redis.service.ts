import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';


@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {
  }


  /**
   * Получает значение по ключу.
   * @param key - Ключ
   * @returns Значение или null, если ключ не найден.
   */
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  /**
   * Устанавливает значение для ключа с опциональным временем жизни.
   * @param key - Ключ
   * @param value - Значение
   * @param ttlSeconds - Время жизни в секундах (Time To Live)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      // 'EX' - команда, которая сразу устанавливает время жизни
      return this.redisClient.set(key, value, 'EX', ttlSeconds);
    }
    return this.redisClient.set(key, value);
  }

  /**
   * Удаляет ключ.
   * @param key - Ключ
   * @returns Количество удаленных ключей (0 или 1).
   */
  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}