import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import type {
  OrderInventoryCategoryScope,
  OrderProductAvailability,
} from '../utils/order-materials';

export const ORDER_PRODUCT_SCOPES = ['sellable', 'service_material', 'tool'] as const;
export const ORDER_PRODUCT_AVAILABILITIES = ['DISPONIBLE', 'SOLICITAR'] as const;

export class AddProductDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  productid?: number;

  @ValidateIf((o) => o.productid == null)
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ValidateIf((o) => o.productid == null)
  @IsIn(ORDER_PRODUCT_SCOPES)
  categoryScope?: OrderInventoryCategoryScope;

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
