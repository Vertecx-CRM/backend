import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayMinSize,
  Matches,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class RoleConfigItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  permissionid: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @IsNotEmpty()
  privilegeid: number;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?!admin$)/i, {
    message: 'No se puede crear un rol con el nombre "admin".',
  })
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
  @ValidateNested({ each: true })
  @Type(() => RoleConfigItemDto)
  roleconfigurations: RoleConfigItemDto[];

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string = 'active';
}