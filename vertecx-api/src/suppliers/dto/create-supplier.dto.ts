import { Transform, Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  IsNumber,
} from "class-validator";

export class CreateSupplierDto {
  @IsString()
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  @MaxLength(50)
  nit: string;

  @IsString()
  @Transform(({ value }) => String(value).replace(/[^\d+]/g, ""))
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?\d{7,15}$/)
  phone: string;

  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsNotEmpty()
  @MaxLength(160)
  email: string;

  @IsString()
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsInt()
  @Min(1)
  stateid: number;

  @IsString()
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  @MaxLength(120)
  contactname: string;

  @IsString()
  @Transform(({ value }) => String(value).trim())
  @IsNotEmpty()
  @MaxLength(255)
  image: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating: number;
}
