import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UserResponseDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(user: CreateUserDto): Promise<UserResponseDto> {
    const newPassword = await bcrypt.hash(user.password, +this.configService.get<number>('HASH_SALT', 0));
    return this.userRepository.save({
      role: user.role,
      username: user.username,
      password: newPassword,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      address: user.address,
      companyId: user.companyId,
    });
  }

  async getUsers(): Promise<UserResponseDto[]> {
    return this.userRepository.find();
  }

  async getUsersByCompanyId(companyId: string): Promise<UserResponseDto[]> {
    return this.userRepository.find({ where: { companyId: companyId } });
  }

  async getUserById(userId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });
  }

  async getUserByUsername(username: string): Promise<UserResponseDto | null> {
    return await this.userRepository.findOne({
      where: { username: username },
      relations: ['company'],
    });
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    return await this.userRepository.findOne({
      where: { email: email },
      relations: ['company'],
    });
  }

  async updateUser(user: UserEntity, newPassword: boolean) {
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(user.password, +this.configService.get<number>('HASH_SALT', 0));
      user.password = hashedPassword;
    }

    return this.userRepository.save(user);
  }
}
