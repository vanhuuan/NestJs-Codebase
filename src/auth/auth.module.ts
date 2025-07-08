import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './adapters/in/auth.controller'; 
import { AuthService } from './application/services/auth.service';
import { LocalStrategy } from './adapters/out/strategies/local.strategy';
import { JwtStrategy } from './adapters/out/strategies/jwt.strategy';
import { getJwtConfig } from '../../config/jwt.config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}