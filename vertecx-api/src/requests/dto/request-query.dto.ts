import {ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class RequestQueryDto {
  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  serviceTypeId?: number;

  @ApiPropertyOptional({ description: 'Desde fecha de agendacion', example: "2025-11-12T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  fromScheduleDate?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  stateId?: number;
}
