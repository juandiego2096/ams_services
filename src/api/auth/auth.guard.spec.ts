import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

import * as jsonwebtoken from 'jsonwebtoken';

const decodeMock = jsonwebtoken.decode as jest.Mock;

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userService: jest.Mocked<Pick<UserService, 'getUserById'>>;

  const createExecutionContext = (request: any) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as any;

  beforeEach(() => {
    userService = {
      getUserById: jest.fn(),
    } as any;
    guard = new AuthGuard(userService as unknown as UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should accept Authorization header with Bearer token', async () => {
    decodeMock.mockReturnValue({ user: '1', role: 'SELLER', exp: Date.now() + 100000 });
    userService.getUserById.mockResolvedValue({ id: '1', role: 'SELLER' } as any);

    const request: any = { headers: { authorization: 'Bearer valid-token' } };
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(decodeMock).toHaveBeenCalledWith('valid-token');
    expect(request.userId).toBe('1');
    expect(request.userRole).toBe('SELLER');
  });

  it('should accept Authorization header without Bearer prefix', async () => {
    decodeMock.mockReturnValue({ user: '2', role: 'ADMIN', exp: Date.now() + 100000 });
    userService.getUserById.mockResolvedValue({ id: '2', role: 'ADMIN' } as any);

    const request: any = { headers: { authorization: 'plain-token' } };
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(decodeMock).toHaveBeenCalledWith('plain-token');
    expect(request.userId).toBe('2');
    expect(request.userRole).toBe('ADMIN');
  });

  it('should throw when Bearer token is missing the value', async () => {
    const request: any = { headers: { authorization: 'Bearer ' } };
    const context = createExecutionContext(request);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(decodeMock).not.toHaveBeenCalled();
    expect(userService.getUserById).not.toHaveBeenCalled();
  });
});
