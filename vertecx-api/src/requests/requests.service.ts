import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/servicerequest.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateServiceRequestDto } from './dto/update-request.dto';
import { States } from '../shared/entities/states.entity';

function localMidnight(ymd: string) {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mm = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mm - 1, d, 0, 0, 0, 0);
}

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest) private readonly repo: Repository<ServiceRequest>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>,
  ) {}

  private async ensureStateExists(stateId: number) {
    if (!stateId) return;
    const ok = await this.statesRepo.exist({ where: { stateid: stateId as any } });
    if (!ok) throw new BadRequestException('stateId no existe');
  }

  async findAllStates() {
    return this.statesRepo.find({ order: { stateid: 'ASC' } as any });
  }

  async create(dto: CreateRequestDto) {
    await this.ensureStateExists(dto.stateId);
    const scheduledAt = dto.scheduledAt ? localMidnight(dto.scheduledAt) ?? new Date(dto.scheduledAt) : null;
    const entity = this.repo.create({
      scheduledAt,
      serviceType: dto.serviceType,
      description: dto.description,
      stateId: dto.stateId,
      serviceId: dto.serviceId,
      clientId: dto.clientId,
    });
    const saved = await this.repo.save(entity);
    return this.repo.findOne({
      where: { serviceRequestId: saved.serviceRequestId },
      relations: ['state', 'service', 'customer', 'customer.users'],
    });
  }

  async findAll() {
    return this.repo.find({
      relations: ['state', 'service', 'customer', 'customer.users'],
      order: { serviceRequestId: 'DESC' },
    });
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { serviceRequestId: id },
      relations: ['state', 'service', 'customer', 'customer.users'],
    });
    if (!entity) throw new NotFoundException('ServiceRequest not found');
    return entity;
  }

  async update(id: number, dto: UpdateServiceRequestDto) {
    const existing = await this.findOne(id);
    if (dto.stateId !== undefined) await this.ensureStateExists(dto.stateId);

    const scheduledAt =
      dto.scheduledAt === undefined
        ? existing.scheduledAt
        : dto.scheduledAt
        ? localMidnight(dto.scheduledAt) ?? new Date(dto.scheduledAt)
        : null;

    const patch: Partial<ServiceRequest> = {
      scheduledAt,
      serviceType: dto.serviceType ?? existing.serviceType,
      description: dto.description ?? existing.description,
      serviceId: dto.serviceId ?? existing.serviceId,
      clientId: dto.clientId ?? existing.clientId,
    };

    if (dto.stateId !== undefined) {
      patch.stateId = dto.stateId;
    }

    await this.repo
      .createQueryBuilder()
      .update(ServiceRequest)
      .set(patch)
      .where('serviceRequestId = :id', { id })
      .execute();

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensureStateExists(4);
    await this.repo
      .createQueryBuilder()
      .update(ServiceRequest)
      .set({ stateId: 4 })
      .where('serviceRequestId = :id', { id })
      .execute();
    return this.findOne(id);
  }
}
