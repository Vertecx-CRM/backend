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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleConfigurationDto } from './dto/update-role.dto';
import { Roles } from './entities/roles.entity';
import { UpdateRoleMatrixDto } from './dto/update-role-matrix.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo rol con sus permisos y privilegios',
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente.' })
  async create(@Body() dto: CreateRoleDto): Promise<Roles> {
    return this.rolesService.create(dto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar todos los roles básicos' })
  async list() {
    return this.rolesService.listRoles();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles.' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id/matrix')
  @ApiOperation({
    summary:
      'Obtener la matriz de módulos (permissions) y privilegios del rol para pintar el checklist',
  })
  async getMatrix(@Param('id', ParseIntPipe) roleid: number) {
    return this.rolesService.getRoleMatrix(roleid);
  }

    @Get(':id/detail')
  @ApiOperation({
    summary: 'Obtener detalle del rol (info básica + configuraciones)',
  })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleDetail(id);
  }

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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por su ID' })
  @ApiResponse({ status: 200, description: 'Rol encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Roles> {
    return this.rolesService.findOne(id);
  }

  @Patch('configurations')
  @ApiOperation({
    summary: 'Actualizar configuraciones (permission + privilege) de un rol',
  })
  async updateConfigurations(@Body() dto: UpdateRoleConfigurationDto) {
    return this.rolesService.updateConfigurations(dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un rol (solo si no está vinculado a usuarios)',
  })
  @ApiResponse({ status: 200, description: 'Rol eliminado exitosamente.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rolesService.remove(id);
  }
}
