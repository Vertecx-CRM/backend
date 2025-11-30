import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class ReprogramOrderDto {
  @IsDateString()
  fechainicio: string;

  @IsDateString()
  fechafin: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horainicio: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horafin: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
