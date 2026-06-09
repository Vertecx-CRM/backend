import {
  IsBoolean,
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
import { RequestPurchasedMaterialDto } from "./request-purchased-material.dto";
import { RequestSiteChecklistDto } from "./request-site-checklist.dto";

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

  @ApiPropertyOptional({
    example: "ASSESSMENT",
    enum: ["ASSESSMENT", "DIRECT_INSTALLATION"],
  })
  @IsOptional()
  @IsString()
  requestMode?: string;

  @ApiPropertyOptional({
    example: "PENDING_REVIEW",
    enum: [
      "NOT_APPLICABLE",
      "PENDING_REVIEW",
      "ASSESSMENT_REQUIRED",
      "READY_TO_QUOTE",
    ],
  })
  @IsOptional()
  @IsString()
  technicalReviewStatus?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Indica si el cliente ya cuenta con materiales",
  })
  @IsOptional()
  @IsBoolean()
  alreadyHasMaterials?: boolean;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  linkedSaleId?: number;

  @ApiPropertyOptional({ example: "VEN-1770000000000" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  linkedSaleCode?: string;

  @ApiPropertyOptional({
    type: [RequestPurchasedMaterialDto],
    description: "Materiales ya comprados o disponibles para la instalacion",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestPurchasedMaterialDto)
  purchasedMaterials?: RequestPurchasedMaterialDto[];

  @ApiPropertyOptional({
    type: RequestSiteChecklistDto,
    description: "Checklist tecnico previo para instalacion directa",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RequestSiteChecklistDto)
  siteChecklist?: RequestSiteChecklistDto;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  serviceId: number;

  @ApiProperty({ example: "MANTENIMIENTO" })
  @IsString()
  @IsNotEmpty()
  serviceType: string;
}
