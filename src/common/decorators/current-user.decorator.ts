import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.type';
import type { UsersEntity } from '../../user/entity/users.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsersEntity =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().authUser,
);
