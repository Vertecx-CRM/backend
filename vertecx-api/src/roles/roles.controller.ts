import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleConfigurationDto } from './dto/update-role.dto';
import { Roles } from './entities/roles.entity';
import { UpdateRoleMatrixDto } from './dto/update-role-matrix.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // 🔹 CREATE ROLE (con permisos y privilegios)
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo rol con sus permisos y privilegios',
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente.' })
  async create(@Body() dto: CreateRoleDto): Promise<Roles> {
    return this.rolesService.create(dto);
  }

  // 🔹 GET ALL ROLES
  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles.' })
  async findAll() {
    return this.rolesService.findAll();
  }

  // 🔹 GET DETAIL (rol + permisos + privilegios)
  @Get(':id/detail')
  @ApiOperation({
    summary: 'Obtener el detalle de un rol (rol + permisos + privilegios)',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del rol con sus configuraciones.',
  })
  async findDetail(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOneDetail(id);
  }

  // 🔹 MATRIZ PARA EL FRONT (pinta el checklist)
  @Get(':id/matrix')
  @ApiOperation({
    summary:
      'Obtener la matriz de módulos (permissions) y privilegios del rol para pintar el checklist',
  })
  async getMatrix(@Param('id', ParseIntPipe) roleid: number) {
    return this.rolesService.getRoleMatrix(roleid);
  }

  // 🔹 REEMPLAZA TODA LA CONFIGURACIÓN DEL ROL SEGÚN EL CHECKLIST
  @Put(':id/configurations')
  @ApiOperation({
    summary:
      'Reemplazar TODAS las configuraciones (permission+privilege) del rol según el checklist',
  })
  @ApiResponse({ status: 200, description: 'Configuración actualizada.' })
  async replaceMatrix(
    @Param('id', ParseIntPipe) roleid: number,
    @Body() dto: UpdateRoleMatrixDto,
  ) {
    return this.rolesService.replaceRoleMatrix(roleid, dto);
  }

  // 🔹 GET ONE ROLE (solo los datos del rol)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por su ID' })
  @ApiResponse({ status: 200, description: 'Rol encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Roles> {
    return this.rolesService.findOne(id);
  }

  // 🟢 NUEVO PATCH (actualiza name/status o configuraciones parciales)
  @Patch('configurations')
  @ApiOperation({
    summary:
      'Actualizar nombre, estado o configuraciones específicas de un rol (sin reemplazar toda la matriz)',
  })
  @ApiBody({
    type: UpdateRoleConfigurationDto,
    examples: {
      withRole: {
        summary: 'Editar name/status del rol y configs',
        value: {
          role: { roleid: 2, name: 'Supervisor', status: 'Activo' },
          configurations: [
            { roleconfigurationid: 2, roleid: 2 },
            { roleconfigurationid: 5, permissionid: 4, privilegeid: 6 },
          ],
        },
      },
      onlyConfigs: {
        summary: 'Solo actualizar configs',
        value: {
          configurations: [
            { roleconfigurationid: 7, permissionid: 1, privilegeid: 2 },
          ],
        },
      },
    },
  })
  async updateConfigurations(@Body() dto: UpdateRoleConfigurationDto) {
    return this.rolesService.updateConfigurations(dto);
  }

  // 🔹 DELETE ROLE
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un rol (solo si no está vinculado a usuarios)',
  })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.remove(id);
  }
}
