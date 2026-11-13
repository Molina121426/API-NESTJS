import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  createProductoSchema,
  type CreateProductoDto,
} from './dto/create-producto.dto.js';
import {
  listProductosQuerySchema,
  type ListProductosQueryDto,
} from './dto/list-productos-query.dto.js';
import {
  updateProductoSchema,
  type UpdateProductoDto,
} from './dto/update-producto.dto.js';
import { Producto } from './entities/producto.entity.js';
import { ProductosExceptionFilter } from './filters/productos-exception.filter.js';
import { ProductoAuthGuard } from './guards/producto-auth.guard.js';
import { ProductosResponseInterceptor } from './interceptors/productos-response.interceptor.js';
import type { PaginatedResult } from './interfaces/paginated-result.interface.js';
import { ParseProductoIdPipe } from './pipes/parse-producto-id.pipe.js';
import { ProductosService } from './productos.service.js';

@Controller('productos')
@UseInterceptors(ProductosResponseInterceptor)
@UseFilters(ProductosExceptionFilter)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ProductoAuthGuard)
  create(
    @Body({ schema: createProductoSchema }) dto: CreateProductoDto,
  ): Producto {
    return this.productosService.create(dto);
  }

  @Get()
  findAll(
    @Query({ schema: listProductosQuerySchema }) query: ListProductosQueryDto,
  ): PaginatedResult<Producto> {
    return this.productosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseProductoIdPipe) id: number): Producto {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(ProductoAuthGuard)
  update(
    @Param('id', ParseProductoIdPipe) id: number,
    @Body({ schema: updateProductoSchema }) dto: UpdateProductoDto,
  ): Producto {
    return this.productosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ProductoAuthGuard)
  remove(@Param('id', ParseProductoIdPipe) id: number): Producto {
    return this.productosService.remove(id);
  }
}
