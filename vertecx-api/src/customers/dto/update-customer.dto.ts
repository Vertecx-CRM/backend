import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {

  // 🔹 Campos propios del customer

  @ApiPropertyOptional({
    description: 'Ciudad del cliente',
    example: 'Medellín',
  })
  @IsString()
  @IsOptional()
  customercity?: string;

  @ApiPropertyOptional({
    description: 'Código postal del cliente',
    example: '050001',
  })
  @IsString()
  @IsOptional()
  customerzipcode?: string;

  // 🔹 Campos del usuario (opcionales en update)

  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiPropertyOptional({ example: 'correo@email.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  documentnumber?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  typeid?: number;

  @ApiPropertyOptional({ example: 'imagen.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  stateid?: number;
}