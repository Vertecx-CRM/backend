import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
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
  ordersServicesId?: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  statesId: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiPropertyOptional({ example: 'Pendiente aprobación cliente' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiProperty({ example: 'MANTENIMIENTO', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  serviceType: string;

  @ApiProperty({ type: [CreateQuoteDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteDetailDto)
  details: CreateQuoteDetailDto[];
}
