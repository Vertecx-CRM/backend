import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleConfigurationDto } from './dto/update-role.dto';
import { Roles } from './entities/roles.entity';

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
  async findAll(): Promise<Roles[]> {
    return this.rolesService.findAll();
  }

  // 🔹 GET ONE ROLE
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
