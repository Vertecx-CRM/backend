import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsDate,
  IsNumber,
  ValidateNested,
  IsArray,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------
// DTO de los productos dentro de la compra
// ---------------------------------------------

export class PurchaseProductItemDto {
  @ApiProperty({
    required: false,
    description:
      'ID del producto existente. Si no se envía, se creará un producto nuevo.',
    example: 12,
  })
  @IsInt()
  @IsOptional()
  productid?: number;

  @ApiProperty({
    description: 'Cantidad del producto en la compra.',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario al que se está comprando el producto.',
    example: 150000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitprice: number;

  @ApiProperty({
    required: false,
    description: 'Descripción u observación del producto en esta compra.',
    example: 'Repuestos electrónicos marca ABC',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description:
      'Nombre del producto. Solo obligatorio si se está creando un producto nuevo.',
    example: 'Cámara IP Hikvision DS-2CD1143',
  })
  @IsOptional()
  @IsString()
  productname?: string;

  @ApiProperty({
    required: false,
    description:
      'Precio del proveedor (costo). Obligatorio si no se envía productid.',
    example: 200000,
  })
  @IsOptional()
  @IsNumber()
  productpriceofsupplier?: number;

  @ApiProperty({
    required: false,
    description:
      'Precio de venta final que se desea asignar al producto. Si no se envía y el producto es nuevo, se calculará automáticamente (30% sobre costo).',
    example: 260000,
  })
  @IsOptional()
  @IsNumber()
  saleprice?: number;
}

// ---------------------------------------------
// DTO principal de la compra
// ---------------------------------------------

export class CreatePurchasesmanagementDto {
  @ApiProperty({
    description:
      'Número de orden temporal. Luego será reemplazado automáticamente con el consecutivo real.',
    example: 'TEMP-001',
  })
  @IsString()
  @IsNotEmpty()
  numberoforder: string;

  @ApiProperty({
    description: 'Número o código de la factura del proveedor.',
    example: 'FAC-99873',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({
    description: 'ID del proveedor de la compra.',
    example: 5,
  })
  @IsInt()
  supplierid: number;

  @ApiProperty({
    required: false,
    description: 'Observación u observaciones adicionales.',
    example: 'Compra urgente para reposición de inventario.',
  })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty({
    description:
      'Estado inicial de la compra. Debe existir en la tabla states.',
    example: 3,
  })
  @IsInt()
  stateid: number;

  @ApiProperty({
    type: [PurchaseProductItemDto],
    description:
      'Listado de productos que componen la compra. Se validan duplicados, cantidades y precios.',
    example: [
      {
        productid: 10,
        quantity: 5,
        unitprice: 150000,
        description: 'Repuestos electrónicos',
        saleprice: 180000,
      },
      {
        productname: 'Router Mikrotik hEX S',
        productpriceofsupplier: 200000,
        quantity: 2,
        unitprice: 200000,
        description: 'Equipo de red',
        saleprice: 260000,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseProductItemDto)
  products: PurchaseProductItemDto[];

  @ApiProperty({
    description: 'Fecha de creación del registro.',
    example: '2025-12-05T12:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  createdat: Date;

  @ApiProperty({
    description: 'Fecha de actualización del registro.',
    example: '2025-12-05T12:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  updatedat: Date;
}
