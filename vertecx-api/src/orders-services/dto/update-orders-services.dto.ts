import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateOrdersServicesDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  clientid?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  stateid?: number;

  @IsOptional()
  @IsDateString()
  fechainicio?: string;

  @IsOptional()
  @IsDateString()
  fechafin?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horainicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horafin?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
