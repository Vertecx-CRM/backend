import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

export class UpsertServiceLineDto {
  @IsInt()
  @Min(1)
  serviceid: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsInt()
  @Min(0)
  unitprice: number;
}

export class UpsertServicesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertServiceLineDto)
  items: UpsertServiceLineDto[];

  @IsOptional()
  @IsBoolean()
  replace?: boolean;
}
