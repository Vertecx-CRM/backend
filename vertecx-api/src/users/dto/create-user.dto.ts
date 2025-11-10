
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El nombre no puede contener números ni caracteres especiales.',
  })
  name: string;

  @IsString({ message: 'El apellido debe ser un texto.' })
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El apellido no puede contener números ni caracteres especiales.',
  })
  lastname: string;

  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email: string;

  @IsString({ message: 'El teléfono debe ser texto numérico.' })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El teléfono debe tener entre 7 y 15 dígitos numéricos.',
  })
  phone: string;

  @IsNumber({}, { message: 'El tipo de documento debe ser un número válido.' })
  typeid: number;

  @IsString({ message: 'El número de documento debe ser texto numérico.' })
  @Matches(/^[0-9]{5,20}$/, {
    message: 'El número de documento debe tener entre 5 y 20 dígitos numéricos.',
  })
  documentnumber: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto (URL o base64).' })
  image?: string;

  @IsNumber({}, { message: 'El estado debe ser un número válido.' })
  stateid: number;

  @IsNumber({}, { message: 'La configuración de rol debe ser un número válido.' })
  roleconfigurationid: number;
}
