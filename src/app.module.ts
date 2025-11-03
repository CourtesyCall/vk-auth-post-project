import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VkModule } from './vk/vk.module';
import { PlaceholderModule } from './placeholder/placeholder.module';
import config from  './configurations/index';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TemplateModule } from './template/template.module';
import { SectionModule } from './section/section.module';
import { DraftsModule } from './drafts/drafts.module';

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
    TemplateModule,
    SectionModule,
    DraftsModule,
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}