import { IsInt, IsNumber, Min, IsOptional } from "class-validator";

export class UpdateServiceLineDto {
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitprice?: number;
}
