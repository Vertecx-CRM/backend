import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsInt()
  userid: number;

  @IsInt()
  stateid: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nit: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipcode?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  rating: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  image: string;
}
