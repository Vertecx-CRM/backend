import { Controller, Get, Query, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export type StatusQuery = 'active' | 'inactive' | 'all';

function normalizeStatus(value?: string): StatusQuery {
  if (!value) return 'active';
  const v = value.toLowerCase().trim();
  if (v === 'active' || v === 'inactive' || v === 'all') return v;
  throw new BadRequestException(`status inválido. Usa: active | inactive | all`);
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos (por defecto solo activos)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'all'],
    description: 'Filtro de estado: active (default) | inactive | all',
  })
  findAll(@Query('status') status?: string) {
    return this.productsService.findAll(normalizeStatus(status));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por id (incluye inactivos)' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar producto: hard si no está referenciado, soft (isactive=false) si está referenciado',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
