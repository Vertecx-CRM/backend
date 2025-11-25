import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsDate,
  IsNumber,
  ValidateNested,
  IsArray,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para los productos de la compra
export class PurchaseProductItemDto {
  @ApiProperty({ required: false })
  @IsInt()
  productid?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitprice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  productpriceofsupplier?: number;
}

export class CreatePurchasesmanagementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  numberoforder: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty()
  @IsInt()
  supplierid: number;

  @ApiProperty()
  @IsInt()
  stateid: number;

  @ApiProperty({ type: [PurchaseProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseProductItemDto)
  products: PurchaseProductItemDto[];

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  createdat: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  updatedat: Date;
}
