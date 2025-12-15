import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
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

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  statesid: number;

  @ApiPropertyOptional({ example: 'Pendiente aprobación cliente' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({ example: 'MANTENIMIENTO', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  servicetype?: string;

  @ApiProperty({ type: [CreateQuoteDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteDetailDto)
  details: CreateQuoteDetailDto[];
}
