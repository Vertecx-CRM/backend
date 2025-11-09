import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  IsBoolean,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Rol con todos los permisos', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: [
      { permissionid: 1, privilegeid: 1 },
      { permissionid: 2, privilegeid: 3 },
    ],
    description: 'Lista de configuraciones (permiso + privilegio)',
  })
  @IsArray()
  @ArrayMinSize(1, {
    message: 'Debe seleccionar al menos un permiso o privilegio.',
  })
  roleconfigurations: { permissionid: number; privilegeid: number }[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}
