import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden de compra' })
  @ApiResponse({
    status: 201,
    description: 'Orden de compra creada exitosamente',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El número de orden ya existe',
  })
  create(
    @Body() dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(dto);
  }

  // READ

  @Get('order-number/:numeroOrden')
  @ApiOperation({ summary: 'Buscar orden por número de orden' })
  @ApiParam({
    name: 'numeroOrden',
    description: 'Número de la orden de compra',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra encontrada',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de compra no encontrada',
  })
  findByNumeroOrden(
    @Param('numeroOrden') numeroOrden: string,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findByNumeroOrden(numeroOrden);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes de compra' })
  @ApiQuery({ name: 'proveedorId', required: false, type: Number })
  @ApiQuery({ name: 'estadoId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes obtenida exitosamente',
    type: [PurchaseOrder],
  })
  findAll(
    @Query('proveedorId') proveedorId?: string,
    @Query('estadoId') estadoId?: string,
  ) {
    if (proveedorId) {
      return this.purchaseOrdersService.findBySupplier(
        parseInt(proveedorId, 10),
      );
    }

    if (estadoId) {
      return this.purchaseOrdersService.findByState(
        parseInt(estadoId, 10),
      );
    }

    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden de compra por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra encontrada',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: 404,
    description: 'Orden de compra no encontrada',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden de compra' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra actualizada exitosamente',
    type: PurchaseOrder,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, dto);
  }

  // CANCEL (ANULACIÓN LÓGICA)
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Anular una orden de compra' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    type: Number,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          example: 'Error en proveedor',
        },
      },
      required: ['motivo'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra anulada exitosamente',
    type: PurchaseOrder,
  })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.cancel(id, motivo);
  }

  // DELETE (TEMPORAL)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden de compra (solo si aplica)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden de compra eliminada exitosamente',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchaseOrdersService.remove(id);
  }
}
