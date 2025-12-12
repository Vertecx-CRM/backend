// purchase-orders/purchase-orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden de compra' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Orden de compra creada exitosamente',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El número de orden ya existe',
  })
  create(@Body() dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las órdenes de compra' })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  @ApiQuery({ name: 'stateId', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de órdenes obtenida exitosamente',
    type: [PurchaseOrder],
  })
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('stateId') stateId?: string,
  ) {
    if (supplierId) {
      return this.purchaseOrdersService.findBySupplier(parseInt(supplierId));
    }
    if (stateId) {
      return this.purchaseOrdersService.findByState(parseInt(stateId));
    }
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden de compra por ID' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orden de compra encontrada',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Get('order-number/:orderNumber')
  @ApiOperation({ summary: 'Buscar orden por número de orden' })
  @ApiParam({ name: 'orderNumber', description: 'Número de la orden' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orden de compra encontrada',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orden de compra actualizada exitosamente',
    type: PurchaseOrder,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orden de compra eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Orden de compra no encontrada',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.purchaseOrdersService.remove(id);
  }
}