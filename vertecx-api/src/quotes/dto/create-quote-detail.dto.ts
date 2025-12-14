import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateQuoteDetailDto {
  @ApiPropertyOptional({
    example: 15,
    description: 'ID del producto (si existe en catálogo)',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  productid?: number | null;

  @ApiProperty({ example: 'Cambio de tarjeta electrónica', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  description: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  unitprice: number;

  @ApiProperty({ example: 170000 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({
    example: 'DISPONIBLE',
    enum: ['DISPONIBLE', 'NO_DISPONIBLE'],
  })
  @IsOptional()
  @IsIn(['DISPONIBLE', 'NO_DISPONIBLE', 'SOLICITAR'])
  availability?: 'DISPONIBLE' | 'NO_DISPONIBLE' | 'SOLICITAR';
}
