import { 
  IsOptional, 
  IsString, 
  IsBoolean, 
  Length, 
  Matches 
} from 'class-validator';

export class UpdateProductsCategoryDto {
  @IsOptional()
  @IsString({ message: 'El icono debe ser una cadena de texto (URL o base64).' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto.' })
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres.' })
  @Matches(/^[A-Za-z\s]+$/, { message: 'El nombre no puede contener valores numéricos ni caracteres especiales.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto.' })
  @Length(0, 255, { message: 'La descripción no debe superar los 255 caracteres.' })
  @Matches(/^[A-Za-z\s]*$/, { message: 'La descripción no puede contener valores numéricos ni caracteres especiales.' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano (true o false).' })
  status?: boolean;
}
