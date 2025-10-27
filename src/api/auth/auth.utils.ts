import { UnauthorizedException } from '@nestjs/common';

const BEARER_PREFIX = /^Bearer\s+/i;

export function extractAuthToken(authorizationHeader: unknown): string {
  if (authorizationHeader === null || authorizationHeader === undefined) {
    throw new UnauthorizedException('token in "authorization" header is not provided');
  }

  if (typeof authorizationHeader !== 'string') {
    throw new UnauthorizedException('Invalid authorization header');
  }

  const trimmedHeader = authorizationHeader.trim();
  if (!trimmedHeader) {
    throw new UnauthorizedException('token in "authorization" header is not provided');
  }

  if (/^Bearer$/i.test(trimmedHeader)) {
    throw new UnauthorizedException('token in "authorization" header is not provided');
  }

  const cleanedToken = BEARER_PREFIX.test(trimmedHeader) ? trimmedHeader.replace(BEARER_PREFIX, '').trim() : trimmedHeader;
  if (!cleanedToken) {
    throw new UnauthorizedException('token in "authorization" header is not provided');
  }

  return cleanedToken;
}
