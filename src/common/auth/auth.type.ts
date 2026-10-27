import type { Request } from 'express';
import type { UsersEntity } from 'src/user/entity/users.entity';


export interface AuthClaims {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  authUser: UsersEntity;
}
