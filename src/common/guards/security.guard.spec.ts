import {
  ExecutionContext,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import axios from 'axios';
import { Request } from 'express';
import { SecurityGuard } from './security.guard';

describe('SecurityGuard', () => {
  let guard: SecurityGuard;
  const handler = () => undefined;

  const createContext = (request: Partial<Request>) =>
    ({
      getHandler: () => handler,
      getClass: () => Object,
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new SecurityGuard(
      new ConfigService({ MS_SECURITY: 'http://security:8181/' }),
      new Reflector(),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards the JWT and canonical cinema URL for permission validation', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { allowed: true } });
    const context = createContext({
      headers: { authorization: 'Bearer user-token' } as Request['headers'],
      path: '/movies/15',
      method: 'DELETE',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      'http://security:8181/api/internal/security/permissions-validation',
      { url: '/cinema/movies/15', method: 'DELETE' },
      {
        headers: { Authorization: 'Bearer user-token' },
        timeout: 5000,
      },
    );
  });

  it('rejects requests without a bearer token', async () => {
    const context = createContext({
      headers: {} as Request['headers'],
      path: '/movies',
      method: 'GET',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('rejects a denied permission', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { allowed: false } });
    const context = createContext({
      headers: { authorization: 'Bearer user-token' } as Request['headers'],
      path: '/movies',
      method: 'POST',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('fails closed when the security service is unavailable', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('network error'));
    const context = createContext({
      headers: { authorization: 'Bearer user-token' } as Request['headers'],
      path: '/movies',
      method: 'POST',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
