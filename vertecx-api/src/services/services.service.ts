import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, QueryFailedError } from 'typeorm';
import { Services } from './entities/services.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Typeofservices } from './entities/typeofservices.entity';
import { States } from './entities/states.entity';
import { ServicesQueryDto } from './dto/services-query.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services) private readonly servicesRepo: Repository<Services>,
    @InjectRepository(Typeofservices) private readonly typesRepo: Repository<Typeofservices>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) { }

  private ensureActiveInactiveState(stateid: number) {
    if (![1, 2].includes(stateid)) {
      throw new BadRequestException('stateid inválido. Solo se permite 1 (Activo) o 2 (Inactivo).');
    }
  }

  private async ensureTypeExistsAndActive(typeofserviceid: number) {
    const type = await this.typesRepo.findOne({ where: { typeofserviceid } });
    if (!type) throw new BadRequestException('El tipo de servicio no existe.');
    if (type.statusid !== 1) throw new BadRequestException('El tipo de servicio está inactivo.');
    return type;
  }

  private ensureNonEmptyImage(image: unknown) {
    const val = typeof image === 'string' ? image.trim() : '';
    if (!val) throw new BadRequestException('No se puede guardar un servicio sin imagen.');
  }

  async getTypes() {
    return this.typesRepo
      .createQueryBuilder('t')
      .select(['t.typeofserviceid', 't.name'])
      .where('t.statusid = :statusid', { statusid: 1 })
      .orderBy('t.typeofserviceid', 'ASC')
      .getMany();
  }

  async getStates() {
    return this.statesRepo.find({
      where: { stateid: In([1, 2]) },
      order: { stateid: 'ASC' },
    });
  }

  async create(dto: CreateServiceDto) {
    if (dto.stateid !== undefined) this.ensureActiveInactiveState(dto.stateid);
    this.ensureNonEmptyImage(dto.image);

    await this.ensureTypeExistsAndActive(dto.typeofserviceid);

    const entity = this.servicesRepo.create({
      name: dto.name,
      description: (dto.description ?? '').trim(),
      image: dto.image.trim(),
      typeofserviceid: dto.typeofserviceid,
      stateid: dto.stateid ?? 1,
    });


    const saved = await this.servicesRepo.save(entity);
    return this.findOne(saved.serviceid);
  }

  async findAll(q: ServicesQueryDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 10, 100);
    const skip = (page - 1) * limit;

    if (q.stateid !== undefined) this.ensureActiveInactiveState(q.stateid);

    const qb = this.servicesRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.typeofservice', 't')
      .leftJoinAndSelect('s.state', 'st')
      .orderBy('s.serviceid', 'DESC');

    if (q.search?.trim()) {
      qb.andWhere('LOWER(s.name) LIKE :search', { search: `%${q.search.trim().toLowerCase()}%` });
    }

    if (q.typeofserviceid) {
      qb.andWhere('s.typeofserviceid = :tid', { tid: q.typeofserviceid });
    }

    if (q.stateid) {
      qb.andWhere('s.stateid = :sid', { sid: q.stateid });
    }

    const total = await qb.getCount();
    const data = await qb.skip(skip).take(limit).getMany();

    return {
      data: data.map((s) => ({
        serviceid: s.serviceid,
        name: s.name,
        description: s.description,
        image: s.image,
        typeofserviceid: s.typeofserviceid,
        typeofservicename: s.typeofservice?.name ?? null,
        stateid: s.stateid,
        statename: s.state?.name ?? null,
      })),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: number) {
    const s = await this.servicesRepo.findOne({
      where: { serviceid: id },
      relations: { typeofservice: true, state: true },
    });

    if (!s) throw new NotFoundException('Servicio no encontrado.');

    return {
      serviceid: s.serviceid,
      name: s.name,
      description: s.description,
      image: s.image,
      typeofserviceid: s.typeofserviceid,
      typeofservicename: s.typeofservice?.name ?? null,
      stateid: s.stateid,
      statename: s.state?.name ?? null,
    };
  }

  async update(id: number, dto: UpdateServiceDto) {
    const existing = await this.servicesRepo.findOne({ where: { serviceid: id } });
    if (!existing) throw new NotFoundException('Servicio no encontrado.');

    if (dto.stateid !== undefined) this.ensureActiveInactiveState(dto.stateid);

    if (dto.typeofserviceid !== undefined) {
      await this.ensureTypeExistsAndActive(dto.typeofserviceid);
    }

    if (dto.image !== undefined) {
      this.ensureNonEmptyImage(dto.image);
    }

    const next = this.servicesRepo.merge(existing, {
      ...(dto.name !== undefined ? { name: String(dto.name).trim() } : {}),
      ...(dto.description !== undefined ? { description: String(dto.description).trim() } : {}),
      ...(dto.image !== undefined ? { image: String(dto.image).trim() } : {}),
      ...(dto.typeofserviceid !== undefined ? { typeofserviceid: dto.typeofserviceid } : {}),
      ...(dto.stateid !== undefined ? { stateid: dto.stateid } : {}),
    });

    await this.servicesRepo.save(next);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.servicesRepo.findOne({ where: { serviceid: id } });
    if (!existing) throw new NotFoundException('Servicio no encontrado.');

    try {
      await this.servicesRepo.delete({ serviceid: id });
      return { message: 'Servicio eliminado correctamente.' };
    } catch (e) {
      if (e instanceof QueryFailedError) {
        const err: any = e;
        if (err?.driverError?.code === '23503') {
          throw new ConflictException(
            'No se puede eliminar el servicio porque está asociado a una solicitud de servicio.',
          );
        }
      }
      throw e;
    }
  }
}
