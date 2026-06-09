import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateSaleFromAuthDto } from './dto/create-sale-from-auth.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { UpdateEstadoPagoDto } from './dto/update-payment-state.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Sales') //  Agrupa las rutas en Swagger bajo "Sales"
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  //  POST /sales
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva venta',
    description:
      'Crea una nueva venta con sus detalles (productos, cantidades, precios, descuentos, etc.). ' +
      'Los campos obligatorios son: customerid, saledate, salecode, subtotal, totalamount y al menos un detalle.',
  })
  @ApiBody({
    type: CreateSaleDto,
    description:
      'Objeto que representa la venta y su detalle. Algunos campos son opcionales y pueden omitirse, ' +
      'en cuyo caso el backend puede aplicar valores por defecto (por ejemplo, impuestos o estado inicial).',
  })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error en la solicitud (por ejemplo, lista de productos vacía, IDs inválidos, o datos inconsistentes).',
  })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Post('from-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Crear una nueva venta para el usuario autenticado',
    description:
      'Crea una nueva venta usando el cliente asociado al usuario autenticado en el token.',
  })
  @ApiBody({
    type: CreateSaleFromAuthDto,
    description:
      'Objeto que representa la venta y su detalle. El customerid se resuelve automáticamente en backend.',
  })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente para el cliente autenticado.',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se pudo resolver el cliente autenticado o la venta contiene datos inconsistentes.',
  })
  createFromAuth(
    @Req() { user }: any,
    @Body() createSaleDto: CreateSaleFromAuthDto,
  ) {
    return this.salesService.createFromAuth(user, createSaleDto);
  }

  // GET /sales
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener todas las ventas',
    description: 'Retorna una lista de todas las ventas con sus detalles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de ventas retornado exitosamente.',
  })
  findAll(@Req() { user }: any) {
    return this.salesService.findAllForUser(user);
  }

  // GET /sales/:id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener una venta por ID',
    description:
      'Retorna la información de una venta específica con sus productos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta a consultar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada y retornada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada.',
  })
  findOne(@Req() { user }: any, @Param('id') id: string) {
    return this.salesService.findOneForUser(user, +id);
  }

  @Get(':id/checkout-summary')
  @ApiOperation({
    summary: 'Obtener el resumen de una venta para el retorno del checkout',
    description:
      'Retorna la venta asociada al checkout cuando la referencia de Wompi coincide con la venta.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta a consultar',
    type: Number,
    example: 124,
  })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada y validada para el checkout.',
  })
  getCheckoutSummary(
    @Param('id', ParseIntPipe) id: number,
    @Query('reference') reference: string,
  ) {
    return this.salesService.findOneForCheckout(id, reference);
  }

  // PATCH /sales/:id
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una venta',
    description:
      'Permite modificar los datos principales de una venta (no modifica los detalles).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta a actualizar',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateSaleDto })
  @ApiResponse({
    status: 200,
    description: 'Venta actualizada correctamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada.',
  })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  // PATCH /sales/:id/estado-pago
  @Patch(':id/estado-pago')
  @ApiOperation({
    summary: 'Actualizar estado de pago de una venta',
    description:
      'Cambia el estadoPago de la venta a "Abonada" o "Pagada". ' +
      'Si se marca como "Pagada", el salestatus se cambia automáticamente a "Completed".',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEstadoPagoDto })
  @ApiResponse({ status: 200, description: 'Estado de pago actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Valor de estadoPago no permitido.' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada.' })
  updateEstadoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoPagoDto,
  ) {
    return this.salesService.updateEstadoPago(id, dto.payState);
  }

  // PATCH /sales/:id/cancel
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar una venta',
    description:
      'Anula una venta existente, revierte el stock de los productos y cambia el estado a "Cancelled". ' +
      'Solo se pueden anular ventas en estado Pending o Completed.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta que se desea cancelar',
    type: Number,
    example: 12,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        observation: {
          type: 'string',
          example: 'Cliente se retractó de la compra',
          description:
            'Razón de la anulación (opcional). Se guardará en las notas de la venta.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La venta fue anulada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error de validación: la venta ya estaba cancelada, el estado no permite cancelación o stock inconsistente.',
  })
  @ApiResponse({
    status: 404,
    description: 'La venta no existe.',
  })
  async cancelSale(
    @Param('id') id: string,
    @Body('observation') observation?: string,
  ) {
    return this.salesService.cancel(+id, observation);
  }

  // DELETE /sales/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una venta',
    description:
      'Elimina una venta específica junto con todos sus detalles relacionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la venta a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Venta eliminada correctamente (sin contenido).',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada.',
  })
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
