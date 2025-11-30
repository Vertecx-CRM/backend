import { IsInt } from 'class-validator';

export class RemoveProductDto {
  @IsInt()
  productid: number;
}
