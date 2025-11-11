import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsIn(['MANTENIMIENTO', 'INSTALACION'])
  serviceType?: 'MANTENIMIENTO' | 'INSTALACION';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  stateId?: number;

  @IsOptional()
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsInt()
  clientId?: number;
}
