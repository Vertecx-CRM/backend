import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrdersServicesProductItemDto {
  @IsInt()
  @Min(1)
  productid: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateOrdersServicesDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  clientid: number;

  @IsInt()
  @Min(1)
  stateid: number;

  @IsDateString()
  fechainicio: string;

  @IsDateString()
  fechafin: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horainicio: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horafin: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrdersServicesProductItemDto)
  products: CreateOrdersServicesProductItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
