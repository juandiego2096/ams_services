import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AppConfigService } from '../../config/configuration.service';
import { AuthResponse } from './auth.type';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  decode: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import * as jsonwebtoken from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getUserByUsername: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: {
            jwtSecret: 'secret',
            jwtExpiration: '1h',
            hashSalt: 10,
            filesPath: './',
            filesUploadFolder: '/uploads',
            serverPort: 3000,
            serverHost: '0.0.0.0',
            socketPort: 81,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser', () => {
    it('should throw when user is not found', async () => {
      userService.getUserByUsername.mockResolvedValue(null);

      await expect(service.validateUser('user', 'pwd')).rejects.toThrow('User not found');
      expect(userService.getUserByUsername).toHaveBeenCalledWith('user');
    });

    it('should return user when password matches', async () => {
      const user = { id: '1', password: 'hash' } as any;
      userService.getUserByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('user', 'pwd');

      expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'hash');
      expect(result).toBe(user);
    });

    it('should return null when password does not match', async () => {
      const user = { id: '1', password: 'hash' } as any;
      userService.getUserByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('user', 'pwd');

      expect(result).toBeNull();
    });
  });

  describe('generateJWT', () => {
    it('should sign jwt with payload from user and config', async () => {
      const user = { id: '1', role: 'ADMIN', password: 'hash' } as any;
      userService.getUserById.mockResolvedValue(user);
      (jsonwebtoken.sign as jest.Mock).mockReturnValue('token');

      const result = (await service.generateJWT(user)) as AuthResponse;

      expect(jsonwebtoken.sign).toHaveBeenCalledWith({ role: 'ADMIN', user: '1' }, 'secret', expect.objectContaining({ expiresIn: '1h' }));
      expect(result.accessToken).toBe('token');
      expect(result.user).toBe(user);
    });

    it('should throw when user not found during JWT generation', async () => {
      userService.getUserById.mockResolvedValue(null);

      await expect(service.generateJWT({ id: '1' } as any)).rejects.toThrow('User not found');
    });
  });

  describe('getUserFromAuthToken', () => {
    it('should return user info when token decodes and user exists', async () => {
      (jsonwebtoken.decode as jest.Mock).mockReturnValue({ user: '1' });
      userService.getUserById.mockResolvedValue({ id: '1', role: 'SELLER' } as any);

      const result = await service.getUserFromAuthToken('token');

      expect(jsonwebtoken.decode).toHaveBeenCalledWith('token');
      expect(result).toEqual({ userId: '1', userRole: 'SELLER' });
    });

    it('should accept Bearer prefixed authorization header', async () => {
      (jsonwebtoken.decode as jest.Mock).mockReturnValue({ user: '3' });
      userService.getUserById.mockResolvedValue({ id: '3', role: 'SELLER' } as any);

      const result = await service.getUserFromAuthToken('Bearer token-3');

      expect(jsonwebtoken.decode).toHaveBeenCalledWith('token-3');
      expect(result).toEqual({ userId: '3', userRole: 'SELLER' });
    });

    it('should return null when decode fails', async () => {
      (jsonwebtoken.decode as jest.Mock).mockReturnValue('invalid');

      const result = await service.getUserFromAuthToken('token');

      expect(result).toBeNull();
    });
  });
});
