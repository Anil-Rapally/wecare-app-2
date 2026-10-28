import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersEntity } from './entity/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/common/auth/auth.module';
import { EmailService } from 'src/common/email/email.service';
import { OtpService } from './otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';


@Module({
    imports: [TypeOrmModule.forFeature([UsersEntity]), AuthModule],
    controllers: [UserController],
    providers: [UserService, EmailService, OtpService, AuthGuard],
})
export class UserModule {}
