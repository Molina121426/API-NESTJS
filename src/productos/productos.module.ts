import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ProductosExceptionFilter } from './filters/productos-exception.filter.js';
import { ProductoAuthGuard } from './guards/producto-auth.guard.js';
import { ProductosResponseInterceptor } from './interceptors/productos-response.interceptor.js';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';

@Module({
  controllers: [ProductosController],
  providers: [
    ProductosService,
    ProductoAuthGuard,
    ProductosResponseInterceptor,
    ProductosExceptionFilter,
    {
      // Activa los DTOs basados en Zod para toda la aplicación.
      provide: APP_PIPE,
      useFactory: () => new StandardSchemaValidationPipe(),
    },
  ],
  exports: [ProductosService],
})
export class ProductosModule {}
