import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateProductDto {
  @ApiProperty({ example: 'Xiaomi Redmi 15C (8GB)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productname: string;

  @ApiPropertyOptional({ example: 'Procesador X, 256GB...' })
  @IsOptional()
  @IsString()
  productdescription?: string | null;

  @ApiProperty({ example: 1, description: 'FK hacia categories.categoryid' })
  @IsInt()
  @Min(1)
  categoryid: number;

  @ApiProperty({
    example: 'Celulares',
    description: 'Texto libre (categoría del proveedor)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  suppliercategory: string;

  @ApiPropertyOptional({
    example: [
      'https://res.cloudinary.com/.../products/img1.png',
      'https://res.cloudinary.com/.../products/img2.png',
    ],
    description: 'Lista de imágenes (máximo 6). Si se envía, image se toma como la primera.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../products/imagen.png',
    description: 'Imagen principal (compatibilidad). Si envías images, se ignora y se toma images[0].',
  })
  @ValidateIf((o) => !o.images || o.images.length === 0)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl()
  image: string;

  @ApiPropertyOptional({ example: '6932554444808' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  productcode?: string | null;

  @ApiPropertyOptional({
    example: 680000,
    description: 'Precio de venta unitario. Lo actualiza el módulo de compras.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsale?: number | null;

  @ApiPropertyOptional({
    example: 520000,
    description:
      'Precio de compra al proveedor. Lo actualiza el módulo de compras.',
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