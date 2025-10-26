import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { HttpException } from '@nestjs/common';
import { ROLES } from '@constants/roles';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserByUsername: jest.fn(),
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
            getUsers: jest.fn(),
            getUsersByCompanyId: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    });

    const module: TestingModule = await moduleBuilder
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => jest.clearAllMocks());

  const createUserDto = {
    username: 'john',
    password: 'secret',
    role: ROLES.ADMIN,
    name: 'John',
    lastname: 'Doe',
    email: 'john@example.com',
    address: 'Main',
    phone: '123',
    companyId: 'company-1',
    active: true,
  };

  it('should create user and strip password from response', async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue(null);
    userService.createUser.mockResolvedValue({ ...createUserDto, id: 'user-1', password: 'hash' } as any);

    const result = await controller.createUser(createUserDto as any);

    expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    expect(result).toMatchObject({ id: 'user-1', username: 'john' });
    expect((result as any).password).toBeUndefined();
  });

  it('should reject creation when username already exists', async () => {
    userService.getUserByUsername.mockResolvedValue({ id: 'user-1' } as any);

    await expect(controller.createUser(createUserDto as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('should reject creation when email already exists', async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue({ id: 'user-1' } as any);

    await expect(controller.createUser(createUserDto as any)).rejects.toBeInstanceOf(HttpException);
  });

  it('should return user by id when found', async () => {
    userService.getUserById.mockResolvedValue({ ...createUserDto, id: 'user-1', password: 'hash' } as any);

    const result = await controller.getUserById('user-1');

    expect(result).toMatchObject({ id: 'user-1' });
  });

  it('should throw when user not found by id', async () => {
    userService.getUserById.mockResolvedValue(null);

    await expect(controller.getUserById('missing')).rejects.toBeInstanceOf(HttpException);
  });

  it('should update user when requester has admin role', async () => {
    const existing = { id: 'user-1', password: 'hash' } as any;
    userService.getUserById.mockResolvedValue(existing);

    await controller.updateUser(
      { userRole: ROLES.ADMIN, userId: 'admin-1' } as any,
      'user-1',
      { password: 'new-secret', name: 'Updated' },
    );

    expect(userService.getUserById).toHaveBeenCalledWith('user-1');
    expect(userService.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated', password: 'new-secret' }),
      true,
    );
  });

  it('should reject update for unauthorized role', async () => {
    await expect(
      controller.updateUser(
        { userRole: ROLES.SELLER, userId: 'user-2' } as any,
        'user-1',
        { name: 'Updated' },
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
