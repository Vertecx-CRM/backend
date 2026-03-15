import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsNumber, IsOptional, Min } from "class-validator";
import { CreateRequestDto } from "./create-request.dto";
import { Transform } from "class-transformer";

export class CreateAdminRequestDto extends CreateRequestDto{
  @ApiProperty({ example: 34 })
  @IsNumber({ allowInfinity: false })
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsDateString()
  scheduledEndAt?: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    { allowInfinity: false },
    { each: true }
  )
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians: number[];
}
