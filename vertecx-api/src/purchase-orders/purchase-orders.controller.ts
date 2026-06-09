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
  HttpCode,
  HttpStatus,
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
import { SendNotificationDto } from './dto/send-notification.dto';
import { PurchaseOrder } from '../shared/entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) { }

  // ─── CREATE ────────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Crear una nueva orden de compra' })
  @ApiResponse({ status: 201, type: PurchaseOrder })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El número de orden ya existe' })
  create(@Body() dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(dto);
  }

  // ─── SEND NOTIFICATION (WhatsApp / Email) ──────────────────────────────────
  @Post('send-notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar orden de compra por WhatsApp o correo al proveedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Payload de notificación generado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'El proveedor no tiene WhatsApp ni correo registrado',
  })
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.purchaseOrdersService.sendNotification(dto);
  }

  // ─── GET PRODUCTS BY SUPPLIER ──────────────────────────────────────────────
  @Get('by-supplier/:supplierId')
  @ApiOperation({ summary: 'Obtener productos asociados a un proveedor' })
  @ApiParam({ name: 'supplierId', type: Number })
  getProductsBySupplier(
    @Param('supplierId', ParseIntPipe) supplierId: number,
  ) {
    return this.purchaseOrdersService.getProductsBySupplier(supplierId);
  }

  // ─── FIND BY NUMERO ORDEN ──────────────────────────────────────────────────
  @Get('order-number/:numeroOrden')
  @ApiOperation({ summary: 'Buscar orden por número de orden' })
  @ApiParam({ name: 'numeroOrden' })
  findByNumeroOrden(
    @Param('numeroOrden') numeroOrden: string,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findByNumeroOrden(numeroOrden);
  }

  // ─── FIND ALL ──────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar órdenes de compra' })
  @ApiQuery({ name: 'proveedorId', required: false, type: Number })
  @ApiQuery({ name: 'estadoId', required: false, type: Number })
  findAll(
    @Query('proveedorId') proveedorId?: string,
    @Query('estadoId') estadoId?: string,
  ) {
    if (proveedorId) {
      return this.purchaseOrdersService.findBySupplier(parseInt(proveedorId, 10));
    }
    if (estadoId) {
      return this.purchaseOrdersService.findByState(parseInt(estadoId, 10));
    }
    return this.purchaseOrdersService.findAll();
  }

  // ─── FIND ONE ──────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden de compra por ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findOne(id);
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una orden de compra' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, dto);
  }

  // ─── CANCEL (ANULACIÓN LÓGICA) ─────────────────────────────────────────────
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Anular una orden de compra' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { motivo: { type: 'string', example: 'Error en proveedor' } },
      required: ['motivo'],
    },
  })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.cancel(id, motivo);
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden de compra' })
  @ApiParam({ name: 'id', type: Number })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.purchaseOrdersService.remove(id);
  }
}
