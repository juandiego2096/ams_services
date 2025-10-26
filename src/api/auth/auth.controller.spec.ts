import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            generateJWT: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should login when credentials are valid', async () => {
    const user = { id: '1' } as any;
    authService.validateUser.mockResolvedValue(user);
    authService.generateJWT.mockResolvedValue({ accessToken: 'token', user } as any);

    const result = await controller.login({ username: 'john', password: 'secret' });

    expect(authService.validateUser).toHaveBeenCalledWith('john', 'secret');
    expect(authService.generateJWT).toHaveBeenCalledWith(user);
    expect(result).toEqual({ accessToken: 'token', user });
  });

  it('should throw when credentials are invalid', async () => {
    authService.validateUser.mockResolvedValue(null);

    await expect(controller.login({ username: 'john', password: 'bad' })).rejects.toBeInstanceOf(HttpException);
    expect(authService.generateJWT).not.toHaveBeenCalled();
  });
});
