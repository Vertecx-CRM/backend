import { IsArray, IsInt } from 'class-validator';

export class AssignTechniciansDto {
  @IsArray()
  @IsInt({ each: true })
  technicians: number[];
}
