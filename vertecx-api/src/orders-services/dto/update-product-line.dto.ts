import { IsInt, Min } from "class-validator";

export class UpdateProductLineDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}
