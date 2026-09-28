import { CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { TokenPurpose } from "../auth/auth.type";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedRequest } from "../auth/auth.type";
import { UnauthorizedException, ForbiddenException, ConflictException } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

const PURPOSE_KEY = 'auth:purpose';
export const RequirePurpose = (purpose: TokenPurpose) => SetMetadata(PURPOSE_KEY, purpose);

export class AuthGuard implements CanActivate {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly i18n: I18nService,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const match = request.headers.authorization?.match(/^Bearer ([^\s]+)$/i);

        if (!match) throw new UnauthorizedException(this.i18n.t('validation.bearer_token_required'));

        const claims = await this.authService.verify_jwt(match[1]);
        const purpose = this.reflector.getAllAndOverride<TokenPurpose>(PURPOSE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? 'access';
        if (claims.purpose !== purpose) {
            throw new ForbiddenException(this.i18n.t('validation.purpose_token_required', {
                args: {
                    purpose,
                },
            }),)
        }
        const user = await this.userRepository.findOneBy({ id: claims.sub });

        if (!user) throw new UnauthorizedException(this.i18n.t('validation.user_not_found'));

        if (purpose === 'signup' && user.is_profile_exists) {
            throw new ConflictException(this.i18n.t('validation.profile_exists'));
        }
        if (purpose === 'access' && !user.is_profile_exists) {
            throw new ForbiddenException(this.i18n.t('validation.complete_profile'));
        }
        request.authUser = user;
        return true;
    }

}
