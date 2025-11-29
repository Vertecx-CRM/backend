import { ApiPropertyOptional } from '@nestjs/swagger';
import {
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

  // Opcional: si lo mandan, NO puede ir vacío
  @ApiPropertyOptional({ example: 'Celulares' })
  @ValidateIf((o) => o.suppliercategory !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  suppliercategory?: string;

  // Opcional: si lo mandan, NO puede ir vacío y debe ser URL
  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../products/x.png' })
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

  @ApiPropertyOptional({ example: 680000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsale?: number | null;

  @ApiPropertyOptional({ example: 520000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  productpriceofsupplier?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isactive?: boolean;
}
