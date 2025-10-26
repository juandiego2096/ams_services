import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@entities/user.entity';
import { Repository } from 'typeorm';
import { AppConfigService } from '../../config/configuration.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<UserEntity>>;
  let configService: jest.Mocked<AppConfigService>;
  const token = getRepositoryToken(UserEntity);

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<UserEntity>>> = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: token, useValue: repoMock },
        {
          provide: AppConfigService,
          useValue: {
            hashSalt: 10,
            jwtSecret: 'secret',
            jwtExpiration: '1h',
            filesPath: './',
            filesUploadFolder: '/uploads',
            serverPort: 3000,
            serverHost: '0.0.0.0',
            socketPort: 81,
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(token);
    configService = module.get(AppConfigService) as jest.Mocked<AppConfigService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should hash password when creating user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    repository.save.mockResolvedValue({ id: 'user-1' } as UserEntity);

    await service.createUser({
      username: 'john',
      password: 'secret',
      role: 'ADMIN',
      name: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      phone: '123',
      address: 'Main',
      companyId: 'company-1',
    } as any);

    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'hashed',
      }),
    );
  });

  it('should fetch users with relations', async () => {
    repository.find.mockResolvedValue([]);

    await service.getUsers();

    expect(repository.find).toHaveBeenCalled();
  });

  it('should update user hashing password when flag true', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('rehash');
    const user = { id: 'user-1', password: 'new' } as UserEntity;

    await service.updateUser(user, true);

    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'rehash' }));
  });

  it('should update user without hashing when flag false', async () => {
    const user = { id: 'user-1', password: 'old' } as UserEntity;

    await service.updateUser(user, false);

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(user);
  });

  it('should get user by id including company relation', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.getUserById('user-1');

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        relations: ['company'],
      }),
    );
  });
});
