import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';

interface ErrorDetails {
  statusCode: number;
  message: string | string[];
  error: string;
  code?: string;
}

/**
 * Captura cualquier excepción lanzada dentro del controlador y responde
 * siempre con la misma estructura, tanto para errores conocidos (404, 409,
 * 400, 401) como para errores inesperados (500).
 */
@Catch()
export class ProductosExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProductosExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const details = this.obtenerDetalles(exception);

    if (details.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack =
        exception instanceof Error ? exception.stack : String(exception);
      const message = Array.isArray(details.message)
        ? details.message.join(', ')
        : details.message;
      this.logger.error(
        `${request.method} ${request.originalUrl}: ${message}`,
        stack,
      );
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        success: false,
        statusCode: details.statusCode,
        error: details.error,
        message: details.message,
        ...(details.code ? { code: details.code } : {}),
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      },
      details.statusCode,
    );
  }

  private obtenerDetalles(exception: unknown): ErrorDetails {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      };
    }

    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { statusCode, message: response, error: exception.name };
    }

    if (typeof response === 'object' && response !== null) {
      const body = response as Record<string, unknown>;
      const message = body.message;
      const error = body.error;
      const code = body.code;

      return {
        statusCode,
        message: Array.isArray(message)
          ? message.map(String)
          : typeof message === 'string'
            ? message
            : exception.message,
        error: typeof error === 'string' ? error : exception.name,
        code: typeof code === 'string' ? code : undefined,
      };
    }

    return {
      statusCode,
      message: exception.message,
      error: exception.name,
    };
  }
}
