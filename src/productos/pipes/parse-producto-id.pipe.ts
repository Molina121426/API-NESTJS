import { Injectable, PipeTransform } from '@nestjs/common';
import { ProductoIdInvalidoException } from '../exceptions/producto-id-invalido.exception.js';

/**
 * Convierte el parámetro de ruta :id en un entero positivo y falla con un 400
 * si el valor no representa un id válido. Se aplica con:
 *
 *   @Param('id', ParseProductoIdPipe) id: number
 */
@Injectable()
export class ParseProductoIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ProductoIdInvalidoException(value);
    }

    return id;
  }
}
