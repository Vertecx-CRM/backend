import {
  IsInt,
  Min,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateRequestDto{
  @ApiProperty({ example: "2025-11-12T10:00:00.000Z" })
  @Transform(({ value }) => value?.trim())
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsDateString()
  scheduledEndAt?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ allowInfinity: false })
  @IsInt()
  @Min(1)
  stateId?: number;

  @ApiProperty({ example: "cr 44 # 20-50" })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(255)
  address: string;

  @ApiProperty({ example: "Equipo no enciende; posible daño en fuente" })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MinLength(3)
  description: string;

  @ApiProperty({ example: 12 })
  @IsNumber({ allowInfinity: false })
  @IsInt()
  @Min(1)
  serviceId: number;

  @ApiProperty({ example: "MANTENIMIENTO" })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  serviceType: string;
}
