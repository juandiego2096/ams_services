import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { username, password }) {
    const userValidate = await this.authService.validateUser(username, password);

    if (!userValidate) {
      throw new HttpException('Data not valid', HttpStatus.BAD_REQUEST);
    }

    const jwt = await this.authService.generateJWT(userValidate);

    return jwt;
  }
}
