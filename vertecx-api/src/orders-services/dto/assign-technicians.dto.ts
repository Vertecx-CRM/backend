import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class AssignTechniciansDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  technicians: number[];
}
