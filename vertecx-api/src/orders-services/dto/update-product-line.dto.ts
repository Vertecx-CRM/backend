import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";
import { ORDER_PRODUCT_AVAILABILITIES } from "./add-product.dto";
import type { OrderProductAvailability } from "../utils/order-materials";

export class UpdateProductLineDto {
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsOptional()
  @IsIn(ORDER_PRODUCT_AVAILABILITIES)
  availability?: OrderProductAvailability;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockcoveredquantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  backorderquantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  specification?: string;

  @IsOptional()
  @IsBoolean()
  manualentry?: boolean;
}
