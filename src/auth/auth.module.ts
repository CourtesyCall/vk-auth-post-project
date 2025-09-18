import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '../redis/redis.module';
import { RolesGuard } from './guards/roles.guard';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';


@Module({
  imports: [
    HttpModule,
    // Добавь HttpModule
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    RedisModule,
    forwardRef(() => UsersModule),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,RolesGuard ,RefreshJwtStrategy],
  exports: [
    AuthService,
    JwtModule,
     // <-- 3. Экспортируйте его, чтобы другие модули могли его использовать
  ]
})
export class AuthModule {}
