import { IsInt, IsOptional, Min } from 'class-validator';

export class AddServiceDto {
  @IsInt()
  @Min(1)
  serviceid: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  unitprice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  precio?: number;
}
