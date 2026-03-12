import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";
import { CreateRequestDto } from "./create-request.dto";

export class CreateAdminRequestDto extends CreateRequestDto{
  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stateId?: number;

  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;
}
