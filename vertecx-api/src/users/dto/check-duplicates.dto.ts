import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CheckDuplicatesDto {
  @IsOptional()
  @IsString()
  documentnumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
