// dto/update-role.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoleConfigUpdateItem {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  roleconfigurationid: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  roleid?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  permissionid?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  privilegeid?: number;
}

export class RolePatchDto {
  @ApiProperty({ example: 1, description: 'ID del rol a editar' })
  @IsInt()
  @IsNotEmpty()
  roleid: number;

  @ApiPropertyOptional({ example: 'Administrador' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Activo' })
  @IsOptional()
  @IsString()
  @IsIn(['Activo', 'Inactivo'])
  status?: string;
}

export class UpdateRoleConfigurationDto {
  @ApiPropertyOptional({
    type: [RoleConfigUpdateItem],
    example: [
      { roleconfigurationid: 2, roleid: 2 },
      { roleconfigurationid: 5, permissionid: 4, privilegeid: 6 },
    ],
    description:
      'Lista de configuraciones a actualizar (se puede cambiar roleid/permissionid/privilegeid). Opcional si solo se edita el rol.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleConfigUpdateItem)
  configurations?: RoleConfigUpdateItem[];

  @ApiPropertyOptional({
    type: RolePatchDto,
    example: { roleid: 2, name: 'Supervisor', status: 'Activo' },
    description:
      'Edición opcional del rol en la misma operación (name/status).',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RolePatchDto)
  role?: RolePatchDto;
}
