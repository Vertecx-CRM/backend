import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class RemoveFileDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
