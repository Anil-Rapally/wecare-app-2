import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { AuthClaims, TokenPurpose } from './auth.type';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        private readonly i18n : I18nService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) { }

    async issue_jwt(email: string, purpose: TokenPurpose) {
        const user = await this.userRepository.findOne ({ where: {email}});
        if (!user) {
            throw new UnauthorizedException(this.i18n.t('validation.user_not_found'));
        }
        const user_id = user.id;
        const expires_in = 300;
        const token = await this.jwt.signAsync(
            {
                sub: user_id, purpose,
                secret: this.config.getOrThrow<string>('JWT_SECRET'),
                algorithm: 'HS256',
                expires_in,
            },
        );
        return { token, expires_in };
    }

    async verify_jwt(token: string): Promise<AuthClaims> {
        try {
            const claims = await this.jwt.verifyAsync<AuthClaims>(token, {
                secret: this.config.getOrThrow<string>('JWT_SECRET'),
                algorithms: ['HS256'],
            });
            if (!claims || !isUUID(claims.sub, '4') || !['signup', 'access'].includes(claims.purpose) || !claims.exp)
                throw new Error(this.i18n.t('validation.invalid_clams'));
            return claims;
        } catch {
            throw new UnauthorizedException(this.i18n.t('validation.expired_token'));
        }
    }
}
