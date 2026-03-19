import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class SalesQueryDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  minDiscountAmount?: number;

  @ApiPropertyOptional({
    description: 'description',
    example: 1500000
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1000)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  minTotalAmount?: number;

  @ApiPropertyOptional({
    description: 'description',
    example: '2025-03-06T00:00:00.000Z'
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsDateString()
  saleDate?: string;

  @ApiPropertyOptional({
    description: 'description',
    example: 3
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsInt()
  @Min(1)
  customerId?: number;

  @ApiPropertyOptional({
    description: 'Código único de la venta',
    example: 'VEN-002'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  saleCode?: string;

  @ApiPropertyOptional({
    description: 'Efectivo, Tarjeta, Transferencia, etc.',
    example: 'Cash'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la venta',
    example: 'Pending'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  saleStatus?: string;

  @ApiPropertyOptional({
    description: 'IDs de los productos',
    example: [1, 2, 3]
  })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true })
  productsIds?: number[];
}