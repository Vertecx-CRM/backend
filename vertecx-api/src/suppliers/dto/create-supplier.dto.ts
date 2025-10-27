import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateSupplierDto {
  @IsInt()
  @IsNotEmpty()
  userid: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  servicetype: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  contactname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nit: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;
}
