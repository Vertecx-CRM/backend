import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsInt,
  Matches,
  IsPositive,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderDto {
  @ApiProperty({
    example: 'PO-2024-001',
    description: 'Número único de la orden de compra',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^PO-\d{4}-\d{3}$/, {
    message: 'El número de orden debe seguir el formato PO-YYYY-NNN',
  })
  orderNumber: string;

  @ApiProperty({
    example: 1500.50,
    description: 'Monto total de la orden',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount?: number;

  @ApiProperty({
    example: '2024-11-06',
    description: 'Fecha de la orden',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  orderDate: Date;

  @ApiProperty({
    example: '2024-11-20',
    description: 'Fecha esperada de entrega',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(() => new Date())
  expectedDeliveryDate?: Date;

  @ApiProperty({
    example: 'Entrega en bodega principal',
    description: 'Notas adicionales sobre la orden',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del estado de la orden',
  })
  @IsInt()
  @IsNotEmpty()
  stateId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del proveedor',
  })
  @IsInt()
  @IsNotEmpty()
  supplierId: number;
}
