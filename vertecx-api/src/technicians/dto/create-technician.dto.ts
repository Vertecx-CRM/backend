import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateTechnicianDto {
  @ApiProperty({
    example: 'kenyah',
    description: 'Nombre del técnico',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'palacios',
    description: 'Apellido del técnico',
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    example: 'kenyahpalacios4@gmail.com',
    description: 'Correo del técnico',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '5107239',
    description: 'Número de documento',
  })
  @IsString()
  @IsNotEmpty()
  documentnumber: string;

  @ApiProperty({
    example: '3002633071',
    description: 'Teléfono del técnico',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../cv.pdf',
    description: 'URL del CV del técnico',
  })
  @IsString()
  @IsNotEmpty()
  CV: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2],
    description: 'IDs de tipos de técnico',
  })
  @IsArray()
  @IsInt({ each: true })
  techniciantypeids: number[];

  @ApiProperty({
    example: 3,
    description: 'ID de configuración de rol para técnico',
    required: false,
  })
  @IsOptional()
  @IsInt()
  roleconfigurationid?: number;
}
