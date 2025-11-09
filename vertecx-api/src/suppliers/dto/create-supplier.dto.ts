import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
  IsUrl,
  IsDate,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nit: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(160)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsInt()
  @IsNotEmpty()
  state: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  contactname: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  image?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number;

  @Type(() => Date)
  @IsDate()
  createat: Date;

  @Type(() => Date)
  @IsDate()
  updateat: Date;
}
