import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMinSize,
  ValidateNested,
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

export class UpdateRoleConfigurationDto {
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
