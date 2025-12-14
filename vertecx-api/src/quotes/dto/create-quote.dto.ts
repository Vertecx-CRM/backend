import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuoteDetailDto } from './create-quote-detail.dto';

export class CreateQuoteDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  serviceRequestId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  ordersservicesid?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  statesid: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @IsPositive()
  customerid: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @IsPositive()
  technicianid: number;

  @ApiPropertyOptional({ example: 'Pendiente aprobación cliente' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({ example: 'Reparación', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  servicetype?: string;

  @ApiPropertyOptional({ example: 170000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({ example: 32300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ example: 202300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @ApiProperty({ type: [CreateQuoteDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteDetailDto)
  details: CreateQuoteDetailDto[];
}
