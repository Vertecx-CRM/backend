import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  /**
   * IMPORTANTE:
   * Si el negocio NO permite cambiar el número de orden,
   * este campo debe existir solo para validación, pero
   * el service debe ignorarlo.
   */

  @ApiPropertyOptional({
    example: 'PO-2024-002',
    description: 'Número de orden (opcional, solo si el negocio lo permite)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  numeroOrden?: string;
  orderNumber: string;
}
