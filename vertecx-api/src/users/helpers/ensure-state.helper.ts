import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { States } from 'src/shared/entities/states.entity';

export async function ensureState(
  manager: EntityManager,
  stateid: number,
) {
  const repo = manager.getRepository(States);

  const state = await repo.findOne({
    where: { stateid },
  });

  if (!state) {
    throw new BadRequestException('Estado inválido.');
  }

  return state;
}
