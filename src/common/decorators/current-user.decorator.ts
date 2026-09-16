import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.type';
import type { UserEntity } from '../../user/entity/user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserEntity =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().authUser,
);
