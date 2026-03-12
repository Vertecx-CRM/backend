import {
  IsArray,
  IsInt,
  Min,
  ArrayNotEmpty,
  
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateRequestFromAuthDto } from "./create-request-from-auth.dto";

export class CreateRequestDto extends CreateRequestFromAuthDto{
  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians: number[];
}
