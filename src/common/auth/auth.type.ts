import type { Request } from 'express';
import type { UsersEntity } from 'src/user/entity/users.entity';

export type TokenPurpose = 'signup' | 'access';

export interface AuthClaims {
  sub: string;
  purpose: TokenPurpose;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  authUser: UsersEntity;
}
