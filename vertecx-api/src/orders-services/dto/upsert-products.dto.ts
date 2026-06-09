import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { AddProductDto } from './add-product.dto';

export class UpsertProductLineDto extends AddProductDto {}

export class UpsertProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertProductLineDto)
  items: UpsertProductLineDto[];

  @IsOptional()
  @IsBoolean()
  replace?: boolean;
}
