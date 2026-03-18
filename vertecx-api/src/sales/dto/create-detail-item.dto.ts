import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, Min, IsOptional, IsString } from "class-validator";

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

  @ApiPropertyOptional({
    description:
      'ID de la solicitud de servicio asociada a la venta. ' +
      'Es opcional y solo se envía cuando la venta incluye un servicio.',
    example: 15,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  servicerequestid?: number;
}