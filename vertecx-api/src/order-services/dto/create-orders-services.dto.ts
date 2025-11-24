import {
  IsInt,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductItemDTO {
  @IsInt()
  productid: number;

  @IsInt()
  cantidad: number;
}

class FileItemDTO {
  @IsString()
  url: string;

  @IsString()
  public_id: string;

  @IsString()
  resource_type: string;

  @IsInt()
  size: number;
}

export class CreateOrdersServicesDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  clientid: number;

  @IsInt()
  stateid: number;

  @IsDateString()
  fechainicio: Date;

  @IsDateString()
  fechafin: Date;

  @IsString()
  horainicio: string;

  @IsString()
  horafin: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDTO)
  products: ProductItemDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileItemDTO)
  files: FileItemDTO[];

  @IsArray()
  @IsInt({ each: true })
  technicians: number[];
}
