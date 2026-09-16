import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { OtpEntity } from './entity/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/common/auth/auth.module';
import { EmailService } from 'src/common/email/email.service';
import { PhotoService } from './photo/photo.service';


@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity]), AuthModule],
    controllers: [UserController],
    providers: [UserService, EmailService, PhotoService],
})
export class UserModule {}
