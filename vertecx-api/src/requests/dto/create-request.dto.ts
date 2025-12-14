import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ArrayNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRequestDto {
  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  @ApiProperty({ example: "MANTENIMIENTO" })
  @IsString()
  @MaxLength(255)
  serviceType: string;

  @ApiProperty({ example: "cr 44 # 20-50" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @ApiProperty({ example: "Equipo no enciende; posible daño en fuente" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stateId?: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  serviceId: number;

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
