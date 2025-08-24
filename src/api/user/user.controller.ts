import { Controller, Post, Get, Body, HttpException, HttpStatus, Param, Request, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserResponseDto, UpdateUserDto } from './user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ROLES } from '@constants/roles';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createUser')
  async createUser(@Body() newUser: CreateUserDto): Promise<UserResponseDto> {
    const userFoundByUsername = await this.userService.getUserByUsername(newUser.username);

    if (userFoundByUsername) {
      throw new HttpException(`User with username ${newUser.username} already exists`, HttpStatus.FOUND);
    }

    const userFoundByEmail = await this.userService.getUserByEmail(newUser.email);

    if (userFoundByEmail) {
      throw new HttpException(`User with email ${newUser.email} already exists`, HttpStatus.FOUND);
    }

    const user = await this.userService.createUser(newUser);
    const dto = plainToInstance(UserResponseDto, user);
    return instanceToPlain(dto) as UserResponseDto;
  }

  @Get('getUsers')
  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getUsers();
    return users.map((u) => instanceToPlain(plainToInstance(UserResponseDto, u))) as UserResponseDto[];
  }

  @Get('getUsersByCompanyId/:companyId')
  async getUsersByCompanyId(@Param('companyId') companyId: string): Promise<UserResponseDto[]> {
    const users = await this.userService.getUsersByCompanyId(companyId);
    return users.map((u) => instanceToPlain(plainToInstance(UserResponseDto, u))) as UserResponseDto[];
  }

  @Get('getUserById/:userId')
  async getUserById(@Param('userId') userId: string): Promise<UserResponseDto> {
    const userFound = await this.userService.getUserById(userId);

    if (!userFound) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const dto = plainToInstance(UserResponseDto, userFound);
    return instanceToPlain(dto) as UserResponseDto;
  }

  @Get('self')
  async getUserSelf(@Request() req): Promise<UserResponseDto> {
    const userFound = await this.userService.getUserById(req.userId);

    if (!userFound) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const dto = plainToInstance(UserResponseDto, userFound);
    return instanceToPlain(dto) as UserResponseDto;
  }

  @Patch('updateUser/:userId')
  async updateUser(@Request() req, @Param('userId') userId: string, @Body() updateUser: UpdateUserDto) {
    if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.userRole)) {
      throw new HttpException('Not authorized to update user', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new HttpException(`User with id  ${userId} not found`, HttpStatus.NOT_FOUND);
    }

    const newPassword = !!(updateUser.password && user.password !== updateUser.password);

    Object.assign(user, updateUser);

    await this.userService.updateUser(user, newPassword);
  }
}
