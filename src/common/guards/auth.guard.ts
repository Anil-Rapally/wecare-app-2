import { CanActivate, ExecutionContext, SetMetadata } from "@nestjs/common";
import { TokenPurpose } from "../auth/auth.type";
import { UserEntity } from "src/user/entity/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedRequest } from "../auth/auth.type";
import { UnauthorizedException, ForbiddenException, ConflictException } from "@nestjs/common";

const PURPOSE_KEY = 'auth:purpose';
export const RequirePurpose = (purpose: TokenPurpose) => SetMetadata(PURPOSE_KEY, purpose);

export class AuthGuard implements CanActivate {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly reflector: Reflector,
        private readonly authService: AuthService
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const match = request.headers.authorization?.match(/^Bearer ([^\s]+)$/i);

        if (!match) throw new UnauthorizedException('A Bearer token is required.');

        const claims = await this.authService.verify(match[1]);
        const purpose = this.reflector.getAllAndOverride<TokenPurpose>(PURPOSE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? 'access';
        if (claims.purpose !== purpose) {
            throw new ForbiddenException(`This endpoint requires a ${purpose} token.`);
        }
        const user = await this.userRepository.findOneBy({ id: claims.sub });

        if (!user?.isEmailVerified) throw new UnauthorizedException('Email verification is required.');

        if (purpose === 'signup' && user.isProfileExists) {
            throw new ConflictException('Profile already exists. Please log in again.');
        }
        if (purpose === 'access' && !user.isProfileExists) {
            throw new ForbiddenException('Complete your profile first.');
        }
        request.authUser = user;
        return true;
    }

}
