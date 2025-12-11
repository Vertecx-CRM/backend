import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ReportWarrantyDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  details: string;

  @IsOptional()
  @IsBoolean()
  notifiedClient?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  reportedByUserId?: number;
}
