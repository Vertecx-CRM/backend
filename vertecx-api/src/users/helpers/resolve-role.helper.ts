import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';

export async function resolveRoleCreate(
  manager: EntityManager,
  dto: CreateUserDto,
  isNit: boolean,
  userService: UsersService,
) {
  let resolvedRoleId = dto.roleid;

  if (isNit && !resolvedRoleId) {
    resolvedRoleId = await userService.getRoleIdByName('cliente');
  }

  if (!resolvedRoleId) {
    throw new BadRequestException('El rol es obligatorio.');
  }

  const role = await userService.getRoleById(resolvedRoleId);
  return role;
}
