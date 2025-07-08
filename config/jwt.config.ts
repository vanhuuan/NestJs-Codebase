import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  return {
    secret: configService.get<string>('JWT_SECRET', 'fb324aa69cd0f5111736efc725d56163e7c0d69d617d91854cd24e2148d59535'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
    },
  };
};