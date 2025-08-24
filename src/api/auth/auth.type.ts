import { ROLES } from '@constants/roles';
import { UserResponseDto } from '../user/user.dto';

export interface PayloadToken {
  user: string;
  role: ROLES;
}

export interface AuthBody {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponseDto;
}

export interface AuthTokenResult {
  role: string;
  user: string;
  iat: number;
  exp: number;
}

export interface IUseToken {
  role: string;
  user: string;
  isExpired: boolean;
}
