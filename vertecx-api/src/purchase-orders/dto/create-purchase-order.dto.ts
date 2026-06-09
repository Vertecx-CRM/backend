import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';
import { FindOperator } from 'typeorm';

export class CreatePurchaseOrderDto {
  // =========================
  // Identificación
  // =========================

  @ApiProperty({
    example: 'PO-2024-001',
    description: 'Número único de la orden de compra',
  })
  @IsString()
  @IsNotEmpty()
  numeroOrden: string;

  // =========================
  // Relaciones
  // =========================

  @ApiProperty({
    example: 1,
    description: 'ID del proveedor',
  })
  @IsInt()
  @Min(1)
  proveedorId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del estado de la orden (Pendiente, Completada, Anulada, etc.)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  estadoId?: number;

  // =========================
  // Fechas
  // =========================

  @ApiProperty({
    example: '2024-11-06',
    description: 'Fecha de creación de la orden',
  })
  @IsDateString()
  fecha: string;

  // =========================
  // Valores económicos
  // =========================

  @ApiProperty({
    example: 150000,
    description: 'Precio unitario del producto o servicio',
  })
  @IsNumber()
  @IsPositive()
  precioUnitario: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad comprada',
  })
  @IsInt()
  @Min(1)
  cantidad: number;

  // =========================
  // Observaciones
  // =========================

  @ApiProperty({
    example: 'Compra de equipos para oficina',
    description: 'Observaciones adicionales',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
  orderNumber: string | FindOperator<string>;
}
