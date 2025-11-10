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
import { ApiProperty } from '@nestjs/swagger';

// 🔹 DTO anidado para los detalles de la venta
export class SaleDetailItemDto {
  @ApiProperty({
    description: 'ID del producto vendido',
    example: 3,
  })
  @IsNumber()
  productid: number;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 5,
  })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0.' })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 12000,
  })
  @IsNumber()
  @Min(0, { message: 'El precio unitario no puede ser negativo.' })
  unitprice: number;

  @ApiProperty({
    description: 'Porcentaje de descuento aplicado al producto (opcional)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discountpercent?: number;

  @ApiProperty({
    description: 'Notas adicionales del producto (opcional)',
    example: 'Promoción especial del día',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

// 🔹 DTO principal para crear la venta
export class CreateSaleDto {
  @ApiProperty({
    description: 'Subtotal de la venta (suma de los productos sin impuestos)',
    example: 50000,
  })
  @IsNumber()
  subtotal: number;

  @ApiProperty({
    description: 'Monto de impuestos aplicados (IVA, etc.)',
    example: 9500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  taxamount?: number;

  @ApiProperty({
    description: 'Descuento total aplicado a la venta',
    example: 2000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  discountamount?: number;

  @ApiProperty({
    description: 'Monto total final de la venta',
    example: 57500,
  })
  @IsNumber()
  totalamount: number;

  @ApiProperty({
    description: 'Fecha en que se realiza la venta',
    example: '2025-11-09T15:30:00.000Z',
  })
  @IsDateString()
  saledate: Date;

  @ApiProperty({
    description: 'ID del cliente asociado a la venta',
    example: 7,
  })
  @IsNumber()
  customerid: number;

  @ApiProperty({
    description: 'Código único de la venta',
    example: 'SALE-001',
  })
  @IsString()
  salecode: string;

  @ApiProperty({
    description: 'Usuario que creó la venta',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdby?: string;

  @ApiProperty({
    description: 'Notas adicionales sobre la venta',
    example: 'Cliente frecuente con descuento especial',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Método de pago (efectivo, tarjeta, transferencia, etc.)',
    example: 'Efectivo',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentmethod?: string;

  @ApiProperty({
    description: 'Estado de la venta (Completada, Pendiente, Cancelada)',
    example: 'Completada',
    required: false,
  })
  @IsOptional()
  @IsString()
  salestatus?: string;

  @ApiProperty({
    description: 'Lista de productos vendidos',
    type: [SaleDetailItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailItemDto)
  details: SaleDetailItemDto[];
}
