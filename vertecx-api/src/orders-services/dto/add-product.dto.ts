import { IsInt, Min } from 'class-validator';

export class AddProductDto {
  @IsInt()
  @Min(1)
  productid: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}
