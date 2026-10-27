import { CanActivate, ExecutionContext } from "@nestjs/common";
import { UsersEntity } from "src/user/entity/users.entity";
import { AuthenticatedRequest } from "../auth/auth.type";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwt: JwtService,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const match = request.headers.authorization?.match(/^Bearer ([^\s]+)$/i);

        if (!match) throw new UnauthorizedException({ message: 'validation.bearer_token_required' });

        try {
            const payload = await this.jwt.verifyAsync(match[1], {
                secret: process.env.JWT_SECRET,
            });
            const user_id = payload.sub;
            request.authUser = { id: user_id, ...payload } as UsersEntity;
        } catch {
            throw new UnauthorizedException({ message: 'validation.invalid_token' });
        }
        return true;
    }

}