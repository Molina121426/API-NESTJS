import { z } from 'zod';

/**
 * Esquema único de verdad para crear un producto.
 *
 * Zod implementa Standard Schema, por lo que Nest puede validarlo con
 * StandardSchemaValidationPipe. El tipo del DTO se infiere del esquema:
 * no hay dos definiciones que puedan quedar desincronizadas.
 */
export const createProductoSchema = z.strictObject({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres'),
  descripcion: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional(),
  precio: z
    .number()
    .finite()
    .positive('El precio debe ser mayor que cero')
    .max(1_000_000, 'El precio no puede superar 1.000.000'),
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  categoria: z
    .string()
    .trim()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(80, 'La categoría no puede superar los 80 caracteres'),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{3,24}$/,
      'El SKU debe tener entre 3 y 24 caracteres: letras, números o guiones',
    ),
  activo: z.boolean().default(true),
});

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
