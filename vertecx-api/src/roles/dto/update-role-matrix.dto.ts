import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RoleMatrixItemDto {
  @ApiProperty({ example: 1, description: 'permissionid (módulo)' })
  @IsInt()
  @IsNotEmpty()
  permissionid: number;

  @ApiProperty({
    example: [1, 2, 3, 4],
    description: 'privilegeids seleccionados para ese módulo',
  })
  @IsArray()
  @IsInt({ each: true })
  // Puede ser [] si deselecciona todo un módulo
  privilegeids: number[];
}

export class UpdateRoleMatrixDto {
  @ApiProperty({
    type: [RoleMatrixItemDto],
    example: [
      { permissionid: 1, privilegeids: [1, 2, 3, 4] }, // “Todos”
      { permissionid: 2, privilegeids: [4] }, // Solo “Ver”
    ],
    description:
      'Lista de módulos con los privilegios seleccionados. Reemplaza toda la configuración del rol.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoleMatrixItemDto)
  items: RoleMatrixItemDto[];
}
