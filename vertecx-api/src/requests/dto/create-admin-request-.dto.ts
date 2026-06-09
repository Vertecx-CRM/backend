import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { CreateRequestDto } from "./create-request.dto";

export class CreateAdminRequestDto extends CreateRequestDto{
  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians: number[];
}
