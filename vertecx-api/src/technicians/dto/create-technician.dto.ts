import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateTechnicianDto {
  @ApiProperty({
    example: 'kenyah',
    description: 'Nombre del tǸcnico',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'palacios',
    description: 'Apellido del tǸcnico',
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    example: 'kenyahpalacios4@gmail.com',
    description: 'Correo del tǸcnico',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '5107239',
    description: 'Nǧmero de documento',
  })
  @IsString()
  @IsNotEmpty()
  documentnumber: string;

  @ApiProperty({
    example: '3002633071',
    description: 'TelǸfono del tǸcnico',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../profile.jpg',
    description: 'URL de la imagen del tǸcnico',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../cv.pdf',
    description: 'URL del CV del tǸnico',
  })
  @IsString()
  @IsNotEmpty()
  CV: string;

  @ApiProperty({
    example: 2,
    description: 'ID del tipo de documento (FK en users.typeid)',
  })
  @IsInt()
  @IsNotEmpty()
  typeid: number;

  @ApiProperty({
    type: [Number],
    example: [1, 2],
    description: 'IDs de tipos de tǸcnico',
  })
  @IsArray()
  @IsInt({ each: true })
  techniciantypeids: number[];

  @ApiProperty({
    example: 3,
    description: 'ID de rol para tǸcnico',
    required: false,
  })
  @IsOptional()
  @IsInt()
  roleid?: number;

  @ApiProperty({
    example: 1,
    description: 'Estado del usuario (1 activo, 2 inactivo)',
    required: false,
    enum: [1, 2],
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 2])
  stateid?: number;
}
