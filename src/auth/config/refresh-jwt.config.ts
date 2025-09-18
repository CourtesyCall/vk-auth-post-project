import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import * as process from 'node:process';


export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions =>({
    secret: process.env.REFRESH_JWT_SECRET,
    expiresIn: '2d',

  })
)