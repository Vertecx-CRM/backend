import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddWorklogDto {
  @IsInt()
  @Min(1)
  technicianid: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  note: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
