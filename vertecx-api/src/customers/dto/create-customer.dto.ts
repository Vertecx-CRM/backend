import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'ID del usuario asociado al cliente',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El ID de usuario es requerido' })
  userid: number;

  @ApiProperty({
    description: 'Ciudad del cliente',
    example: 'Bogotá',
    required: false
  })
  @IsString()
  @IsOptional()
  customercity?: string;

  @ApiProperty({
    description: 'Código postal del cliente',
    example: '110111',
    required: false
  })
  @IsString()
  @IsOptional()
  customerzipcode?: string;
}