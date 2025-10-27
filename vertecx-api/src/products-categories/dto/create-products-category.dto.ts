import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  Length, 
  Matches 
} from 'class-validator';

export class CreateProductsCategoryDto {
  @IsOptional()
  @IsString({ message: 'The icon must be a text string (URL or base64).' })
  icon?: string;

  @IsString({ message: 'The field "name" must be text.' })
  @Length(3, 50, { message: 'The name must have between 3 and 50 characters.' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'The name cannot contain numeric values or special characters.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'The description must be text.' })
  @Length(0, 255, { message: 'The description must not exceed 255 characters.' })
  @Matches(/^[A-Za-z\s]*$/, { message: 'The description cannot contain numeric values or special characters.' })
  description?: string;

  @IsBoolean({ message: 'The status must be a boolean value (true or false).' })
  status: boolean = true;
}
