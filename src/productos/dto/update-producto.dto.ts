import { z } from 'zod';
import { createProductoSchema } from './create-producto.dto.js';

/**
 * Todos los campos de creación pasan a ser opcionales, pero se exige al menos
 * uno para evitar PATCH vacíos. `.partial()` es el equivalente con esquemas de
 * PartialType() en los DTOs basados en clases.
 */
export const updateProductoSchema = createProductoSchema
  .partial()
  // .partial() conserva los valores por defecto de stock y activo. Al
  // redefinirlos como opcionales sin default evitamos que un PATCH que solo
  // cambia el precio reinicie el stock o reactive el producto.
  .extend({
    stock: z.number().int().min(0, 'El stock no puede ser negativo').optional(),
    activo: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
