import { IsOptional, IsString, MinLength, MaxLength, IsInt, Min } from "class-validator";

export class CreateRequestFromAuthDto {
  @IsOptional()
  @IsString()
  scheduledAt?: string | null;

  @IsOptional()
  @IsString()
  scheduledEndAt?: string | null;

  @IsString()
  serviceType: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  direccion: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  stateId?: number;

  @IsInt()
  @Min(1)
  serviceId: number;
}
