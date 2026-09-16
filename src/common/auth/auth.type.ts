import type { Request } from 'express';
import type { UserEntity } from 'src/user/entity/user.entity';

export type TokenPurpose = 'signup' | 'access';

export interface AuthClaims {
  sub: string;
  purpose: TokenPurpose;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  authUser: UserEntity;
}
