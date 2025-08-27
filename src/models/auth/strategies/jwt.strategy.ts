import {  Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AuthJwtPayload } from '../dto/auth-jwtPayload';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
   // @Inject(jwtConfig.KEY)
    private authService: AuthService,
   configService: ConfigService,
    //jwtConfiguration :ConfigType<typeof jwtConfig> ,

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
     // secretOrKey: jwtConfiguration.secret || 'your_jwt_secret',
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_jwt_secret'
    });
  }

  async validate(payload: AuthJwtPayload) {
    return this.authService.validateJWtUser(payload.sub); // то, что попадёт в req.user
  }
}
