import { z } from 'zod';

/**
 * Query string del listado. z.coerce convierte los valores, que siempre
 * llegan como texto, antes de validarlos.
 */
export const listProductosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(120).optional(),
  categoria: z.string().trim().min(1).max(80).optional(),
  activo: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sort: z.enum(['nombre', 'precio', 'stock', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListProductosQueryDto = z.infer<typeof listProductosQuerySchema>;
