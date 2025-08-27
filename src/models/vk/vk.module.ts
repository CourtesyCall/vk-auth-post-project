import { Module } from '@nestjs/common';
import { VkService } from './vk.service';
import { VkController } from './vk.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PlaceholderModule } from '../placeholder/placeholder.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    UsersModule, // Импортируем UsersModule
    PlaceholderModule, // Импортируем PlaceholderModule
    AuthModule, // Импортируем AuthModule для доступа к его провайдерам (Guard)
    RedisModule,
  ],
  providers: [VkService],
  controllers: [VkController],
  exports: [VkService], // Экспортируем сервис, если он нужен в других модулях
})
export class VkModule {}
