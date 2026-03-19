import { PartialType } from "@nestjs/mapped-types";
import { CreateRequestDto } from "./create-request.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, Min } from "class-validator";

export class UpdateServiceRequestDto extends PartialType(CreateRequestDto) {
  @ApiPropertyOptional({
    type: [Number],
    description: "Tecnicos asignados a la solicitud",
    example: [12, 18],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians?: number[];
}
