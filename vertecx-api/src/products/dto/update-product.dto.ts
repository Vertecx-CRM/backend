import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Xiaomi Redmi 15C (8GB)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productname?: string;

  @ApiPropertyOptional({ example: 'Procesador X, 256GB...' })
  @IsOptional()
  @IsString()
  productdescription?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  categoryid?: number;

  @ApiPropertyOptional({ example: 'Celulares' })
  @ValidateIf((o) => o.suppliercategory !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  suppliercategory?: string;

  // NUEVO
  @ApiPropertyOptional({
    example: [
      'https://res.cloudinary.com/.../products/img1.png',
      'https://res.cloudinary.com/.../products/img2.png',
    ],
    description: 'Reemplaza la galería completa (1 a 6).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../products/x.png',
    description: 'Imagen principal (compatibilidad).',
  })
  @ValidateIf((o) => o.image !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({ example: '6932554444808' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  productcode?: string | null;

  @ApiPropertyOptional({
    example: 680000,
    description: 'Precio de venta unitario. Normalmente lo ajusta compras.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsale?: number | null;

  @ApiPropertyOptional({
    example: 520000,
    description: 'Precio de compra al proveedor. Normalmente lo ajusta compras.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsupplier?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}