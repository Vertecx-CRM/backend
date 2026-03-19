import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class RequestPurchasedMaterialDto {
  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;

  @ApiPropertyOptional({ example: "Cable UTP Cat 6" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 35000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: "Compra del carrito" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
