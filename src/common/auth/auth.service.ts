import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { UsersEntity } from 'src/user/entity/users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        @InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>,
    ) { }

    async issue_jwt(user_id: string){
        const expires_in = 300;
        const token = await this.jwt.signAsync(
            {sub: user_id,},
            {
                secret: this.config.getOrThrow<string>('JWT_SECRET'),
                algorithm: 'HS256',
                expiresIn: expires_in,
            }
        );
        return {token, expires_in};
    }
}
