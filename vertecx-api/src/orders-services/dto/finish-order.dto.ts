import { IsDateString, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class FinishOrderDto {
  @IsDateString()
  fechafin: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horafin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  stateid?: number;
}
