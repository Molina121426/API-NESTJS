import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/**
 * Guard de autenticación por token Bearer.
 *
 * El token esperado se configura con PRODUCTOS_API_TOKEN. El valor por
 * defecto existe solo para facilitar las pruebas locales; en producción la
 * variable de entorno es obligatoria.
 */
@Injectable()
export class ProductoAuthGuard implements CanActivate {
  private readonly tokenEsperado =
    process.env.PRODUCTOS_API_TOKEN ?? 'dev-token-productos';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    if (
      scheme !== 'Bearer' ||
      !token ||
      !this.sonIguales(token, this.tokenEsperado)
    ) {
      throw new UnauthorizedException(
        'Debes enviar un token Bearer válido en Authorization',
      );
    }

    return true;
  }

  private sonIguales(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return (
      bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB)
    );
  }
}
