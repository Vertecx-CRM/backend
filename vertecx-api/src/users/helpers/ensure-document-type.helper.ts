import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Typeofdocuments } from 'src/shared/entities/typeofdocuments.entity';

export async function ensureDocumentType(
  manager: EntityManager,
  typeid: number,
) {
  const repo = manager.getRepository(Typeofdocuments);

  const docType = await repo.findOne({
    where: { typeofdocumentid: typeid },
  });

  if (!docType) {
    throw new BadRequestException('Tipo de documento inválido.');
  }

  const isNit = docType.name?.toUpperCase() === 'NIT';

  return { docType, isNit };
}
