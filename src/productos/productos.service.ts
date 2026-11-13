import { Injectable, Logger } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { ListProductosQueryDto } from './dto/list-productos-query.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { Producto } from './entities/producto.entity.js';
import { ProductoNotFoundException } from './exceptions/producto-not-found.exception.js';
import { ProductoSkuDuplicadoException } from './exceptions/producto-sku-duplicado.exception.js';
import { PaginatedResult } from './interfaces/paginated-result.interface.js';

/**
 * Lógica de negocio y acceso a datos.
 *
 * El repositorio en memoria permite que el recurso funcione sin base de datos.
 * Para persistir, reemplaza el Map por un repositorio de TypeORM/Drizzle/
 * Prisma manteniendo la misma API pública del servicio.
 */
@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);
  private readonly productos = new Map<number, Producto>();
  private siguienteId = 1;

  create(dto: CreateProductoDto): Producto {
    this.assertSkuDisponible(dto.sku);

    const now = new Date();
    const producto = new Producto(
      this.siguienteId++,
      dto.nombre,
      dto.descripcion ?? '',
      dto.precio,
      dto.stock,
      dto.categoria,
      dto.sku,
      dto.activo,
      now,
      now,
    );

    this.productos.set(producto.id, producto);
    this.logger.log(`Producto creado: ${producto.id} (${producto.sku})`);
    return producto;
  }

  findAll(query: ListProductosQueryDto): PaginatedResult<Producto> {
    let items = [...this.productos.values()];

    if (query.search) {
      const term = query.search.toLocaleLowerCase('es');
      items = items.filter(
        (producto) =>
          producto.nombre.toLocaleLowerCase('es').includes(term) ||
          producto.sku.toLocaleLowerCase('es').includes(term) ||
          producto.descripcion.toLocaleLowerCase('es').includes(term) ||
          producto.categoria.toLocaleLowerCase('es').includes(term),
      );
    }

    if (query.categoria) {
      const categoria = query.categoria.toLocaleLowerCase('es');
      items = items.filter(
        (producto) => producto.categoria.toLocaleLowerCase('es') === categoria,
      );
    }

    if (query.activo !== undefined) {
      items = items.filter((producto) => producto.activo === query.activo);
    }

    items.sort((a, b) => this.comparar(a, b, query.sort, query.order));

    const total = items.length;
    const totalPages = Math.ceil(total / query.limit);
    const start = (query.page - 1) * query.limit;

    return {
      items: items.slice(start, start + query.limit),
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    };
  }

  findOne(id: number): Producto {
    const producto = this.productos.get(id);
    if (!producto) {
      throw new ProductoNotFoundException(id);
    }
    return producto;
  }

  update(id: number, dto: UpdateProductoDto): Producto {
    const producto = this.findOne(id);

    if (dto.sku !== undefined && dto.sku !== producto.sku) {
      this.assertSkuDisponible(dto.sku, id);
      producto.sku = dto.sku;
    }

    if (dto.nombre !== undefined) producto.nombre = dto.nombre;
    if (dto.descripcion !== undefined) producto.descripcion = dto.descripcion;
    if (dto.precio !== undefined) producto.precio = dto.precio;
    if (dto.stock !== undefined) producto.stock = dto.stock;
    if (dto.categoria !== undefined) producto.categoria = dto.categoria;
    if (dto.activo !== undefined) producto.activo = dto.activo;

    producto.updatedAt = new Date();
    this.logger.log(`Producto actualizado: ${producto.id}`);
    return producto;
  }

  remove(id: number): Producto {
    const producto = this.findOne(id);
    this.productos.delete(id);
    this.logger.log(`Producto eliminado: ${producto.id}`);
    return producto;
  }

  private assertSkuDisponible(sku: string, ignorarId?: number): void {
    for (const producto of this.productos.values()) {
      if (producto.sku === sku && producto.id !== ignorarId) {
        throw new ProductoSkuDuplicadoException(sku);
      }
    }
  }

  private comparar(
    a: Producto,
    b: Producto,
    sort: ListProductosQueryDto['sort'],
    order: ListProductosQueryDto['order'],
  ): number {
    const direction = order === 'asc' ? 1 : -1;

    switch (sort) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre, 'es') * direction;
      case 'precio':
        return (a.precio - b.precio) * direction;
      case 'stock':
        return (a.stock - b.stock) * direction;
      case 'createdAt':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * direction;
    }
  }
}
