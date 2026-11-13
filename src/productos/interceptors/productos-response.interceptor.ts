import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, map, tap } from 'rxjs';
import type { ApiResponse } from '../interfaces/api-response.interface.js';
import type { PaginatedResult } from '../interfaces/paginated-result.interface.js';

function esPaginado(value: unknown): value is PaginatedResult<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.items) &&
    typeof candidate.page === 'number' &&
    typeof candidate.limit === 'number' &&
    typeof candidate.total === 'number' &&
    typeof candidate.totalPages === 'number'
  );
}

/**
 * Envuelve toda respuesta exitosa del controlador en un sobre uniforme:
 *
 * {
 *   "success": true,
 *   "data": ...,
 *   "meta": { "statusCode": 200, "durationMs": 4, ... }
 * }
 *
 * Si el servicio devuelve un resultado paginado, mueve los totales a meta y
 * deja únicamente los elementos en data.
 */
@Injectable()
export class ProductosResponseInterceptor implements NestInterceptor<
  unknown,
  ApiResponse
> {
  private readonly logger = new Logger(ProductosResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((payload): ApiResponse => {
        const paginated = esPaginado(payload);

        return {
          success: true,
          data: paginated ? payload.items : payload,
          meta: {
            statusCode: response.statusCode,
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
            method: request.method,
            durationMs: Date.now() - startedAt,
            ...(paginated
              ? {
                  pagination: {
                    page: payload.page,
                    limit: payload.limit,
                    total: payload.total,
                    totalPages: payload.totalPages,
                  },
                }
              : {}),
          },
        };
      }),
      tap({
        next: (body) =>
          this.logger.log(
            `${request.method} ${request.originalUrl} -> ${body.meta.statusCode} (${body.meta.durationMs}ms)`,
          ),
      }),
    );
  }
}
