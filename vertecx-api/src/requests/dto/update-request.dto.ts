import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CreateRequestDto } from "./create-request.dto";

export class UpdateServiceRequestDto extends PartialType(CreateRequestDto) {}
