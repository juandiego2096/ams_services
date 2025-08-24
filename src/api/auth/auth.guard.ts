import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { decode } from 'jsonwebtoken';
import { IUseToken, AuthTokenResult } from './auth.type';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers['authorization'];
    if (!authToken) throw new UnauthorizedException('token in "authorization" header is not provided');

    const decodedAuthToken = decode(authToken) as AuthTokenResult;
    if (!decodedAuthToken || typeof decodedAuthToken === 'string') {
      throw new UnauthorizedException('Cannot decode jwt token');
    }
    const currentDate = new Date();
    const expiresDate = new Date(decodedAuthToken.exp);

    const manageToken: IUseToken | string = {
      user: decodedAuthToken.user,
      role: decodedAuthToken.role,
      isExpired: +expiresDate <= +currentDate / 1000,
    };

    if (typeof manageToken === 'string') {
      throw new UnauthorizedException(manageToken);
    }

    if (manageToken.isExpired) {
      throw new UnauthorizedException('Token expired');
    }

    const { user } = manageToken;
    const finfUser = await this.userService.getUserById(user);
    if (finfUser === null || finfUser === undefined) {
      throw new UnauthorizedException('Invalid user');
    }

    request.userId = finfUser.id;
    request.userRole = finfUser.role;
    return true;
  }
}
