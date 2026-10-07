import { CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { TokenPurpose } from "../auth/auth.type";
import { UsersEntity } from "src/user/entity/users.entity";
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
        @InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>,
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly i18n: I18nService,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const match = request.headers.authorization?.match(/^Bearer ([^\s]+)$/i);

        if (!match) throw new UnauthorizedException({message: 'validation.bearer_token_required'});

        const claims = await this.authService.verify_jwt(match[1]);
        const purpose = this.reflector.getAllAndOverride<TokenPurpose>(PURPOSE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? 'access';
        if (claims.purpose !== purpose) {
            throw new ForbiddenException({message: 'validation.purpose_token_required', messageArgs: {
                    purpose,
                },
            });
        }
        const user = await this.userRepository.findOneBy({ id: claims.sub });

        if (!user) throw new UnauthorizedException({message: 'validation.user_not_found'});

        if (purpose === 'signup' && user.is_profile_exists) {
            throw new ConflictException({message: 'validation.profile_exists'});
        }
        if (purpose === 'access' && !user.is_profile_exists) {
            throw new ForbiddenException({message: 'validation.complete_profile'});
        }
        request.authUser = user;
        return true;
    }

}
