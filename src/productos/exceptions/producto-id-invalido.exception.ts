import { BadRequestException } from '@nestjs/common';

export class ProductoIdInvalidoException extends BadRequestException {
  constructor(value: string) {
    super({
      message: `El id "${value}" no es un identificador de producto válido`,
      error: 'Bad Request',
      code: 'PRODUCTO_ID_INVALIDO',
    });
  }
}
