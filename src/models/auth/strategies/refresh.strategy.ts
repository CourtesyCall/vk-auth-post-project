import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthJwtPayload } from '../dto/auth-jwtPayload';

//import refreshJwtConfig from '../config/refresh-jwt.config';


@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    configService: ConfigService,
    //@Inject(refreshJwtConfig.KEY)
    //private refreshJwtConfiguration :ConfigType<typeof refreshJwtConfig> ,

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //secretOrKey: refreshJwtConfiguration.secret || 'your_jwt_secret',
      secretOrKey: configService.get<string>('REFRESH_JWT_SECRET') || 'your_jwt_secret'

    });
  }

  async validate(payload: AuthJwtPayload) {
    return {id: payload.sub}; // то, что попадёт в req.user
  }
}
