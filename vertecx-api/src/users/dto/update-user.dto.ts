import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(3, 50, { message: 'El nombre debe tener entre 3 y 50 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El nombre no puede contener números ni caracteres especiales.',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser texto.' })
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: 'El apellido no puede contener números ni caracteres especiales.',
  })
  lastname?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto.' })
  @Length(6, 100, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'La confirmación de contraseña debe ser texto.' })
  @Match('password', { message: 'Las contraseñas no coinciden.' })
  confirmPassword?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto numérico.' })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El teléfono debe tener entre 7 y 15 dígitos numéricos.',
  })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El tipo de documento debe ser un número válido.' })
  typeid?: number;

  @IsOptional()
  @IsString({ message: 'El número de documento debe ser texto numérico.' })
  @Matches(/^[0-9]{5,20}$/, {
    message: 'El número de documento debe tener entre 5 y 20 dígitos numéricos.',
  })
  documentnumber?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto (URL o base64).' })
  image?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El estado debe ser un número válido.' })
  stateid?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La configuración de rol debe ser un número válido.' })
  roleconfigurationid?: number;
}
