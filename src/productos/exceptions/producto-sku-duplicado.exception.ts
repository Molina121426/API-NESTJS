import { ConflictException } from '@nestjs/common';

export class ProductoSkuDuplicadoException extends ConflictException {
  constructor(sku: string) {
    super({
      message: `Ya existe un producto con el SKU "${sku}"`,
      error: 'Conflict',
      code: 'PRODUCTO_SKU_DUPLICADO',
    });
  }
}
