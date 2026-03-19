import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { RequestAvailabilityOptionDto } from "./request-availability-option.dto";

export class CreateRequestDto {
  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stateId?: number;

  @ApiProperty({ example: "cr 44 # 20-50" })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(255)
  address: string;

  @ApiProperty({ example: "Equipo no enciende; posible dano en fuente" })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiPropertyOptional({
    type: [RequestAvailabilityOptionDto],
    description: "Opciones de disponibilidad propuestas por el cliente",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestAvailabilityOptionDto)
  availabilityOptions?: RequestAvailabilityOptionDto[];

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  serviceId: number;

  @ApiProperty({ example: "MANTENIMIENTO" })
  @IsString()
  @IsNotEmpty()
  serviceType: string;
}
