import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, QueryFailedError } from 'typeorm';
import { Services } from './entities/services.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Typeofservices } from './entities/typeofservices.entity';
import { States } from './entities/states.entity';
import { ServicesQueryDto } from './dto/services-query.dto';
import { EnsureServiceDto } from './dto/ensure-service.dto';

const DEFAULT_SERVICE_IMAGE = '/assets/imgs/services/bannerservices.jpg';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepo: Repository<Services>,
    @InjectRepository(Typeofservices)
    private readonly typesRepo: Repository<Typeofservices>,
    @InjectRepository(States)
    private readonly statesRepo: Repository<States>,
  ) {}

  private ensureActiveInactiveState(stateid: number) {
    if (![1, 2].includes(stateid)) {
      throw new BadRequestException(
        'stateid inválido. Solo se permite 1 (Activo) o 2 (Inactivo).',
      );
    }
  }

  private async ensureTypeExistsAndActive(typeofserviceid: number) {
    const type = await this.typesRepo.findOne({ where: { typeofserviceid } });
    if (!type) throw new BadRequestException('El tipo de servicio no existe.');
    if (type.statusid !== 1) {
      throw new BadRequestException('El tipo de servicio está inactivo.');
    }
    return type;
  }

  private ensureNonEmptyImage(image: unknown) {
    const val = typeof image === 'string' ? image.trim() : '';
    if (!val) throw new BadRequestException('No se puede guardar un servicio sin imagen.');
  }

  private normalizeServiceName(name: unknown) {
    return String(name ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private async findExistingByNameAndType(name: string, typeofserviceid: number) {
    const normalizedTarget = this.normalizeServiceName(name);
    const candidates = await this.servicesRepo.find({
      where: { typeofserviceid },
      order: { serviceid: 'DESC' },
    });

    return (
      candidates.find((item) => this.normalizeServiceName(item.name) === normalizedTarget) ??
      null
    );
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

  async ensure(dto: EnsureServiceDto) {
    const name = String(dto.name ?? '').trim();
    if (!name) throw new BadRequestException('El nombre del servicio es obligatorio.');

    await this.ensureTypeExistsAndActive(dto.typeofserviceid);

    const existing = await this.findExistingByNameAndType(name, dto.typeofserviceid);
    if (existing) return this.findOne(existing.serviceid);

    return this.create({
      name,
      description: String(dto.description ?? name).trim(),
      image: DEFAULT_SERVICE_IMAGE,
      typeofserviceid: dto.typeofserviceid,
      stateid: 1,
    });
  }

  async findAll(q: ServicesQueryDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 10, 100);
    const skip = (page - 1) * limit;

    if (q.stateid !== undefined) this.ensureActiveInactiveState(q.stateid);

    const baseQb = this.servicesRepo
      .createQueryBuilder('s')
      .leftJoin('s.typeofservice', 't')
      .leftJoin('s.state', 'st');

    if (q.search?.trim()) {
      baseQb.andWhere('LOWER(s.name) LIKE :search', {
        search: `%${q.search.trim().toLowerCase()}%`,
      });
    }

    if (q.typeofserviceid) {
      baseQb.andWhere('s.typeofserviceid = :tid', { tid: q.typeofserviceid });
    }

    if (q.stateid) {
      baseQb.andWhere('s.stateid = :sid', { sid: q.stateid });
    }

    const { cnt } = await baseQb
      .clone()
      .select('COUNT(1)', 'cnt')
      .getRawOne<{ cnt: string }>();

    const total = Number(cnt ?? 0);

    const rows = await baseQb
      .select([
        's.serviceid AS serviceid',
        's.name AS name',
        's.description AS description',
        's.image AS image',
        's.typeofserviceid AS typeofserviceid',
        't.name AS typeofservicename',
        's.stateid AS stateid',
        'st.name AS statename',
      ])
      .orderBy('s.serviceid', 'DESC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    return {
      data: rows.map((r) => ({
        serviceid: Number(r.serviceid),
        name: r.name,
        description: r.description,
        image: r.image,
        typeofserviceid: Number(r.typeofserviceid),
        typeofservicename: r.typeofservicename ?? null,
        stateid: Number(r.stateid),
        statename: r.statename ?? null,
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
    const row = await this.servicesRepo
      .createQueryBuilder('s')
      .leftJoin('s.typeofservice', 't')
      .leftJoin('s.state', 'st')
      .select([
        's.serviceid AS serviceid',
        's.name AS name',
        's.description AS description',
        's.image AS image',
        's.typeofserviceid AS typeofserviceid',
        't.name AS typeofservicename',
        's.stateid AS stateid',
        'st.name AS statename',
      ])
      .where('s.serviceid = :id', { id })
      .getRawOne();

    if (!row) throw new NotFoundException('Servicio no encontrado.');

    return {
      serviceid: Number(row.serviceid),
      name: row.name,
      description: row.description,
      image: row.image,
      typeofserviceid: Number(row.typeofserviceid),
      typeofservicename: row.typeofservicename ?? null,
      stateid: Number(row.stateid),
      statename: row.statename ?? null,
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
    try {
      const res = await this.servicesRepo.delete({ serviceid: id });

      if (!res.affected) {
        throw new NotFoundException('Servicio no encontrado.');
      }

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
