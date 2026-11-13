import { NotFoundException } from '@nestjs/common';

/**
 * Excepción específica del dominio. Extiende la excepción HTTP de Nest para
 * conservar el status code, pero añade un código de error estable para que los
 * clientes no dependan del texto del mensaje.
 */
export class ProductoNotFoundException extends NotFoundException {
  constructor(id: number) {
    super({
      message: `Producto con id ${id} no encontrado`,
      error: 'Not Found',
      code: 'PRODUCTO_NOT_FOUND',
    });
  }
}
