import {
  IsInt,
  Min,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRequestDto{
  @ApiProperty({ example: "2025-11-12T10:00:00.000Z" })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  @ApiProperty({ example: "cr 44 # 20-50" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @ApiProperty({ example: "Equipo no enciende; posible daño en fuente" })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  serviceId: number;

  @ApiProperty({ example: "MANTENIMIENTO" })
  @IsString()
  @IsNotEmpty()
  serviceType: string;
}
