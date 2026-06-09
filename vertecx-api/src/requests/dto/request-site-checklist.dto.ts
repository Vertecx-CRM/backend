import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsIn, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class RequestSiteChecklistDto {
  @ApiPropertyOptional({ example: "Fachada principal del segundo piso" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  installationArea?: string;

  @ApiPropertyOptional({ example: "Aprox. 4 metros" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  installationHeight?: string;

  @ApiPropertyOptional({ example: "Entre 12 y 15 metros" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  estimatedCableMeters?: string;

  @ApiPropertyOptional({ example: "YES", enum: ["YES", "NO", "UNKNOWN"] })
  @IsOptional()
  @IsIn(["YES", "NO", "UNKNOWN"])
  needsLadder?: "YES" | "NO" | "UNKNOWN";

  @ApiPropertyOptional({ example: "YES", enum: ["YES", "NO", "UNKNOWN"] })
  @IsOptional()
  @IsIn(["YES", "NO", "UNKNOWN"])
  hasPowerPoint?: "YES" | "NO" | "UNKNOWN";

  @ApiPropertyOptional({ example: "NO", enum: ["YES", "NO", "UNKNOWN"] })
  @IsOptional()
  @IsIn(["YES", "NO", "UNKNOWN"])
  hasInternetPoint?: "YES" | "NO" | "UNKNOWN";

  @ApiPropertyOptional({ example: "Ya compre camara, soporte y cable UTP." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  materialsSummary?: string;

  @ApiPropertyOptional({ example: "El cable puede pasar por el ducto lateral." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  additionalContext?: string;

  @ApiPropertyOptional({ example: "Puedo enviar fotos por WhatsApp." })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  evidenceNotes?: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  evidenceImages?: string[];
}
