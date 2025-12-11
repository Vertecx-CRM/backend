import { IsDateString, IsString, Matches } from 'class-validator';

export class FinishOrderDto {
  @IsDateString()
  fechafin: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horafin: string;
}
