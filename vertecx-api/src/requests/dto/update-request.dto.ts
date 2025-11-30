import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateRequestDto } from "./create-request.dto";

export class UpdateServiceRequestDto extends PartialType(CreateRequestDto) {
  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  scheduledAt?: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  scheduledEndAt?: string;
}
