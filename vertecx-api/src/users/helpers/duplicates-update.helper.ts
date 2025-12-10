import { BadRequestException } from '@nestjs/common';
import { EntityManager, Not } from 'typeorm';
import { Users } from '../entities/users.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export async function ensureNoDuplicatesOnUpdate(
  id: number,
  dto: UpdateUserDto,
  manager: EntityManager,
) {
  const repo = manager.getRepository(Users);

  const conditions: any[] = [];

  if (dto.email) conditions.push({ email: dto.email, userid: Not(id) });
  if (dto.documentnumber) conditions.push({ documentnumber: dto.documentnumber, userid: Not(id) });
  if (dto.phone) conditions.push({ phone: dto.phone, userid: Not(id) });

  if (conditions.length === 0) return;

  const duplicate = await repo.findOne({ where: conditions });

  if (duplicate) {
    throw new BadRequestException('Ya existe un usuario con esos datos.');
  }
}
