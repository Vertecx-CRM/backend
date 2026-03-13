import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength, MaxLength, IsInt, Min, IsDateString, IsNotEmpty } from "class-validator";

export class CreateRequestFromAuthDto{
  @ApiPropertyOptional({ example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: "2025-11-12T11:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  @ApiProperty({ example: "cr 44 # 20-50" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  direccion: string;

  @ApiProperty({ example: "Equipo no enciende; posible daño en fuente" })
  @IsString()
  @MinLength(3)
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

  @ApiProperty({ example: 'mantenimiento' })
  @IsString()
  @IsNotEmpty()
  serviceType: string;
}
