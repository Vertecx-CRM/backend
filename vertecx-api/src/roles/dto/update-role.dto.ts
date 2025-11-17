import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsString,
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

export class UpdateRoleInfoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  roleid: number;

  @ApiPropertyOptional({ example: 'Administrador' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateRoleConfigurationDto {
  @ApiPropertyOptional({
    type: UpdateRoleInfoDto,
    description:
      'Información opcional del rol a actualizar (name/status). Si viene, se actualiza el rol.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateRoleInfoDto)
  role?: UpdateRoleInfoDto;

  @ApiProperty({
    type: [RoleConfigUpdateItem],
    example: [
      { roleconfigurationid: 2, roleid: 2 },
      { roleconfigurationid: 5, permissionid: 4, privilegeid: 6 },
    ],
    description:
      'Lista de configuraciones a actualizar (se puede cambiar roleid/permissionid/privilegeid)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoleConfigUpdateItem)
  configurations: RoleConfigUpdateItem[];
}
