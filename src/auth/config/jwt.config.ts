import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import * as process from 'node:process';


export default registerAs(
  'jwt',
  (): JwtModuleOptions =>({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '60m',
    }
  })
)