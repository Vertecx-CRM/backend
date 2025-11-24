import { IsInt } from 'class-validator';

export class AddProductDto {
  @IsInt()
  productid: number;

  @IsInt()
  cantidad: number;
}
