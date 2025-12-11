import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 🔹 DTO anidado para los detalles de la venta
export class SaleDetailItemDto {
  @ApiProperty({
    description:
      'ID del producto vendido. Debe existir previamente en el catálogo de productos.',
    example: 10,
  })
  @IsNumber()
  productid: number;

  @ApiProperty({
    description: 'Cantidad del producto en esta línea de detalle.',
    example: 2,
  })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0.' })
  quantity: number;

  @ApiProperty({
    description:
      'Precio unitario del producto en el momento de la venta. Usualmente viene del precio de venta configurado en el producto.',
    example: 500000,
  })
  @IsNumber()
  @Min(0, { message: 'El precio unitario no puede ser negativo.' })
  unitprice: number;

  @ApiPropertyOptional({
    description:
      'Porcentaje de descuento aplicado a este producto. Si no se envía, se asume 0%.',
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  discountpercent?: number;

  @ApiPropertyOptional({
    description:
      'Notas adicionales del producto (comentarios, promociones, condiciones especiales). Puede omitirse.',
    example: 'Aplicado descuento por promoción del día.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

// 🔹 DTO principal para crear la venta
export class CreateSaleDto {
  @ApiProperty({
    description:
      'Subtotal de la venta (suma de los productos sin impuestos ni descuentos globales). ' +
      'En un escenario ideal el backend puede recalcularlo a partir de los detalles.',
    example: 1100000,
  })
  @IsNumber()
  subtotal: number;

  @ApiPropertyOptional({
    description:
      'Monto total de impuestos aplicados (IVA, etc.). Si no se envía, puede asumirse 0 desde el backend.',
    example: 209000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  taxamount?: number;

  @ApiPropertyOptional({
    description:
      'Descuento total aplicado a la venta (a nivel global). Si no se envía, puede asumirse 0.',
    example: 0,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  discountamount?: number;

  @ApiProperty({
    description:
      'Monto total final de la venta (subtotal + impuestos - descuentos). ' +
      'El backend puede validar que coincida con los detalles.',
    example: 1309000,
  })
  @IsNumber()
  totalamount: number;

  @ApiProperty({
    description:
      'Fecha en que se realiza la venta en formato ISO 8601. Se recomienda enviarla en UTC.',
    example: '2025-03-06T00:00:00.000Z',
  })
  @IsDateString()
  saledate: string;

  @ApiProperty({
    description: 'ID del cliente asociado a la venta.',
    example: 1,
  })
  @IsNumber()
  customerid: number;

  @ApiProperty({
    description:
      'Código único de la venta. No debe repetirse. La base de datos tiene una restricción UNIQUE sobre este valor.',
    example: 'VEN-002',
  })
  @IsString()
  salecode: string;

  @ApiPropertyOptional({
    description:
      'Usuario que creó la venta. En producción normalmente se toma del token (usuario autenticado) y no del cliente. ' +
      'Puede ser nulo si el sistema aún no maneja autenticación.',
    example: 'admin',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  createdby?: string;

  @ApiPropertyOptional({
    description:
      'Notas adicionales sobre la venta (comentarios generales, condiciones especiales, observaciones del cliente).',
    example: 'Entregado en sitio. Factura física firmada.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Método de pago utilizado (Efectivo, Tarjeta, Transferencia, etc.). ' +
      'Si no se envía, el backend puede asignar un valor por defecto, por ejemplo "Pendiente de pago".',
    example: 'Cash',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  paymentmethod?: string;

  @ApiPropertyOptional({
    description:
      'Estado inicial de la venta. Ejemplos: "Pending", "Completed", "Cancelled". ' +
      'Si no se envía, el backend puede asignar un estado por defecto (por ejemplo "Pending").',
    example: 'Pending',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  salestatus?: string;

  @ApiProperty({
    description:
      'Lista de productos vendidos en esta venta. No puede estar vacía. ' +
      'Cada elemento representa una línea de detalle.',
    type: [SaleDetailItemDto],
    example: [
      {
        productid: 10,
        quantity: 2,
        unitprice: 500000,
        discountpercent: 0,
        notes: 'Incluye protector de pantalla',
      },
      {
        productid: 8,
        quantity: 1,
        unitprice: 100000,
        discountpercent: 0,
        notes: 'Cliente pidió empaque de regalo',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailItemDto)
  details: SaleDetailItemDto[];

  @ApiPropertyOptional({
    description:
      'Porcentaje de impuesto aplicado a la venta (por ejemplo, el IVA general). ' +
      'Puede usarse para que el backend calcule taxamount automáticamente. Si no se envía, se puede asumir 0.',
    example: 19,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  taxpercent?: number;
}
