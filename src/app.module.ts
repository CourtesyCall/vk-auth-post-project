import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './models/auth/auth.module';
import { UsersModule } from './models/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VkModule } from './models/vk/vk.module';
import { PlaceholderModule } from './models/placeholder/placeholder.module';
import config from  './configurations/index';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // Время жизни окна в миллисекундах (60 секунд)
      limit: 10,  // Максимальное количество запросов с одного IP за это время
    }]),
    ConfigModule.forRoot({
      isGlobal: true, // глобальный доступ ко всем env
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // <-- Используем это для автоматической загрузки сущностей
        synchronize: true,      // Используй миграции. Включать для тестов
      }),
    }),
    AuthModule,
    UsersModule,
    VkModule,
    PlaceholderModule,
    RedisModule,
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}