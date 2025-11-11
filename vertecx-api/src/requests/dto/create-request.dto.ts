import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiPropertyOptional({ example: '2025-11-12' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ example: 'MANTENIMIENTO' })
  @IsString()
  @MaxLength(255)
  serviceType: string;

  @ApiProperty({ example: 'Equipo no enciende; posible daño en fuente' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  stateId: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  serviceId: number;

  @ApiProperty({ example: 34 })
  @IsInt()
  @Min(1)
  clientId: number;
}
