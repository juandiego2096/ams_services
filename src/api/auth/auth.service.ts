import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { AuthResponse, AuthTokenResult, PayloadToken } from './auth.type';
import { UserResponseDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt';
import { decode } from 'jsonwebtoken';
import { AppConfigService } from '../../config/configuration.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  public async validateUser(username: string, password: string): Promise<UserResponseDto | null> {
    const userByUsername = await this.userService.getUserByUsername(username);

    if (userByUsername == null || userByUsername == undefined) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (userByUsername) {
      const match = await bcrypt.compare(password, userByUsername.password);
      if (match) return userByUsername;
    }

    return null;
  }

  public signJWT({ payload, secret, expires }: { payload: jwt.JwtPayload; secret: string; expires: number | string }): string {
    return jwt.sign(payload, secret, { expiresIn: expires });
  }

  public async generateJWT(user: UserResponseDto): Promise<AuthResponse> {
    const getUser: UserResponseDto | null = await this.userService.getUserById(user.id);

    if (getUser === null || getUser === undefined) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let payload: PayloadToken | null = null;

    if (getUser) {
      payload = {
        role: getUser.role,
        user: getUser.id,
      };
    }

    return {
      accessToken: this.signJWT({
        payload,
        secret: this.configService.jwtSecret,
        expires: this.configService.jwtExpiration,
      }),
      user,
    };
  }

  public async getUserFromAuthToken(authToken: string) {
    const decodedAuthToken = decode(authToken) as AuthTokenResult;
    if (!decodedAuthToken || typeof decodedAuthToken === 'string') {
      console.log('Cannot decode jwt token');
      return null;
    }

    const findUser = await this.userService.getUserById(decodedAuthToken.user);
    if (findUser === null || findUser === undefined) {
      console.log('Invalid user');
      return null;
    }

    return {
      userId: findUser.id,
      userRole: findUser.role,
    };
  }
}
