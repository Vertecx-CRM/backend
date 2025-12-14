import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';

export class UpsertProductLineDto {
  @IsInt()
  @Min(1)
  productid: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class UpsertProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertProductLineDto)
  items: UpsertProductLineDto[];

  @IsOptional()
  @IsBoolean()
  replace?: boolean;
}
