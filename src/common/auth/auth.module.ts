import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';
import { UsersEntity } from '../../user/entity/users.entity';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const secret = config.getOrThrow<string>('JWT_SECRET');

      if (!secret.trim()) {
        throw new Error('JWT_SECRET must not be empty');
      }
      return {
        secret,
        signOptions: {
          expiresIn: '15m',
        },
      };
    },
  })],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule { }
