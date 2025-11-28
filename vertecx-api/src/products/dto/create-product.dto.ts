import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'Celulares', description: 'Texto libre (categoría del proveedor)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  suppliercategory?: string | null;

  @ApiPropertyOptional({ example: '6932554444808' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  productcode?: string | null;

  @ApiPropertyOptional({ example: 680000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsale?: number | null;

  @ApiProperty({ example: 520000 })
  @IsNumber()
  @Min(0)
  productpriceofsupplier: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}
