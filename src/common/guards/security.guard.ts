import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import axios from 'axios';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';


interface PermissionValidationResponse {
  allowed: boolean;
}

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger(SecurityGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
      throw new UnauthorizedException(
        'Token de autorización faltante o inválido',
      );
    }

    const securityBaseUrl = this.configService
      .get<string>('MS_SECURITY')
      ?.trim()
      .replace(/\/+$/, '');

    if (!securityBaseUrl) {
      this.logger.error('MS_SECURITY no está configurada');
      throw new ServiceUnavailableException(
        'Servicio de seguridad no configurado',
      );
    }

    let response;
    try {
      response = await axios.post<PermissionValidationResponse>(
        `${securityBaseUrl}/api/internal/security/permissions-validation`,
        {
          url: `${request.path}`,
          method: request.method,
        },
        {
          headers: { Authorization: authorization },
          timeout: 5000,
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      this.logger.error('No fue posible consultar el servicio de seguridad');
      throw new ServiceUnavailableException(
        'Servicio de seguridad no disponible',
      );
    }

    if (typeof response.data?.allowed !== 'boolean') {
      this.logger.error('Respuesta inválida del servicio de seguridad');
      throw new ServiceUnavailableException(
        'Respuesta inválida del servicio de seguridad',
      );
    }

    if (response.data.allowed) return true;

    this.logger.warn(`Permiso denegado para ${request.method} ${request.path}`);
    throw new ForbiddenException(
      'No tiene permiso para acceder a este recurso',
    );
  }
}
