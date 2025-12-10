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
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { PurchasesmanagementService } from './purchasesmanagement.service';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';
import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';

@ApiTags('Purchases Management')
@Controller('purchasesmanagement')
export class PurchasesmanagementController {
  constructor(private readonly service: PurchasesmanagementService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una compra',
    description: `
Crea un registro de compra con sus productos asociados (purchase_products).

Este endpoint permite:
- Registrar una nueva compra.
- Crear productos nuevos si el productid no existe.
- Actualizar stock.
- Asignar precios de compra y opcionalmente precio de venta.
- Registrar detalles adicionales como referencia, estado, proveedor y observaciones.

Las validaciones incluyen:
- Productos obligatorios.
- Duplicados.
- Coherencia en precios.
- Fechas válidas.
- Validaciones de proveedor y estado.
`,
  })
  @ApiBody({
    description: 'Datos necesarios para registrar una compra',
    required: true,
    type: CreatePurchasesmanagementDto,
    examples: {
      ejemploCompleto: {
        summary: 'Payload completo con producto existente y producto nuevo',
        value: {
          numberoforder: 'TEMP-001',
          reference: 'FAC-9876',
          supplierid: 3,
          observation: 'Compra urgente para reposición de inventario',
          stateid: 3,
          createdat: '2025-12-05T12:00:00.000Z',
          updatedat: '2025-12-05T12:00:00.000Z',
          products: [
            {
              productid: 10,
              quantity: 5,
              unitprice: 150000,
              description: 'Repuestos electrónicos',
              saleprice: 180000,
            },
            {
              productname: 'Cámara IP Hikvision',
              productpriceofsupplier: 200000,
              quantity: 2,
              unitprice: 200000,
              description: 'Equipo de vigilancia',
              saleprice: 260000,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Compra creada correctamente',
    type: Purchasesmanagement,
  })
  @ApiResponse({
    status: 400,
    description: `
- Debe incluir al menos un producto.
- No se permiten productos duplicados.
- La cantidad debe ser mayor a 0.
- El precio unitario debe ser mayor a 0.
- El price of sale no puede ser menor que el price of supplier.
- Las fechas deben ser coherentes.
`,
  })
  @ApiResponse({
    status: 404,
    description: `
- Proveedor no encontrado.
- Estado no encontrado.
`,
  })
  create(@Body() dto: CreatePurchasesmanagementDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros de compras' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro por ID' })
  @ApiResponse({ status: 200, type: Purchasesmanagement })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de compras' })
  update(@Param('id') id: number, @Body() dto: UpdatePurchasesmanagementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de compras' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar una compra existente',
    description:
      'Anula una compra solo si su estado actual es "Aprobado" (stateid = 3). ' +
      'Si ya está anulada (stateid = 8) o si se encuentra en otro estado, la operación será rechazada. ' +
      'Opcionalmente puede enviarse una observación explicando el motivo de la anulación.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la compra que se desea cancelar',
    example: 12,
  })
  @ApiQuery({
    name: 'observation',
    required: false,
    type: String,
    description: 'Observación opcional indicando el motivo de la anulación',
    example: 'El proveedor notificó inconsistencias en la factura',
  })
  @ApiResponse({
    status: 200,
    description: 'Compra anulada exitosamente',
    type: Purchasesmanagement,
  })
  @ApiResponse({
    status: 404,
    description: 'Compra no encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'La compra ya está anulada o no puede ser anulada debido a su estado actual',
  })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Query('observation') observation?: string,
  ) {
    return this.service.cancel(id, observation);
  }
}
