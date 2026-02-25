import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  // ============================
  // 🔹 Campos del Usuario
  // ============================

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastname: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@email.com',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Número de documento',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  documentnumber: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '3001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  phone: string;

  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  typeid: number;

  @ApiProperty({
    description: 'URL de la imagen del usuario',
    example: 'https://miapp.com/avatar.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'ID del estado (opcional, si no se envía se asigna Activo)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  stateid?: number;

  // ============================
  // 🔹 Campos propios del Customer
  // ============================

  @ApiProperty({
    description: 'Ciudad del cliente',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  customercity: string;

  @ApiProperty({
    description: 'Código postal del cliente',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty({ message: 'El código postal es obligatorio' })
  customerzipcode: string;
}