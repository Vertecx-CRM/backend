import { IsString } from 'class-validator';

export class FinishOrderDto {
  @IsString()
  horafin: string;

  @IsString()
  fechafin: string;
}
