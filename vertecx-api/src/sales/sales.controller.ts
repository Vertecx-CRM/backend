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
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Sales') //  Agrupa las rutas en Swagger bajo "Sales"
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

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

  // GET /sales
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las ventas',
    description: 'Retorna una lista de todas las ventas con sus detalles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de ventas retornado exitosamente.',
  })
  findAll() {
    return this.salesService.findAll();
  }

  // GET /sales/:id
  @Get(':id')
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
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
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
