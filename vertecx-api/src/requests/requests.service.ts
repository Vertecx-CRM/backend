import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ServiceRequest } from "./entities/servicerequest.entity";
import { ServiceRequestTechnician } from "./entities/servicerequest-technician.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateServiceRequestDto } from "./dto/update-request.dto";
import { States } from "../shared/entities/states.entity";

function localMidnight(ymd: string) {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mm = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mm - 1, d, 0, 0, 0, 0);
}

function toDateOrNull(input?: string | null) {
  if (input === undefined) return undefined;
  if (input === null || input === "") return null;

  const asMidnight = localMidnight(input);
  if (asMidnight) return asMidnight;

  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new BadRequestException("Fecha/hora inválida");
  return d;
}

function ensureEndAfterStart(start: Date | null, end: Date | null) {
  if (start && end && end <= start) {
    throw new BadRequestException("La hora final debe ser mayor que la hora inicial.");
  }
}

function uniqPositiveInts(arr: number[]) {
  const set = new Set<number>();
  for (const x of arr || []) {
    const n = Number(x);
    if (Number.isFinite(n) && n > 0) set.add(n);
  }
  return Array.from(set.values());
}

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest) private readonly repo: Repository<ServiceRequest>,
    @InjectRepository(ServiceRequestTechnician)
    private readonly linkRepo: Repository<ServiceRequestTechnician>,
    @InjectRepository(States) private readonly statesRepo: Repository<States>
  ) {}

  private async ensureStateExists(stateId: number) {
    if (!stateId) return;
    const ok = await this.statesRepo.exist({ where: { stateid: stateId as any } });
    if (!ok) throw new BadRequestException("stateId no existe");
  }

  async findAllStates() {
    return this.statesRepo.find({ order: { stateid: "ASC" } as any });
  }

  private relations() {
    return [
      "state",
      "service",
      "customer",
      "customer.users",
      "techniciansMap",
      "techniciansMap.technician",
      "techniciansMap.technician.users",
    ];
  }

  async create(dto: CreateRequestDto) {
    await this.ensureStateExists(5);

    const technicians = uniqPositiveInts(dto.technicians || []);
    if (!technicians.length) throw new BadRequestException("Selecciona al menos un técnico.");

    const direccion = String(dto?.direccion ?? "").trim();
    if (!direccion) throw new BadRequestException("direccion should not be empty");
    if (direccion.length > 255) {
      throw new BadRequestException("direccion must be shorter than or equal to 255 characters");
    }

    const startParsed = toDateOrNull(dto.scheduledAt ?? undefined);
    const endParsed = toDateOrNull(dto.scheduledEndAt ?? undefined);

    const scheduledAt = startParsed === undefined ? new Date() : startParsed;
    const scheduledEndAt = endParsed === undefined ? null : endParsed;

    ensureEndAfterStart(scheduledAt, scheduledEndAt);

    const saved = await this.repo.manager.transaction(async (manager) => {
      const srRepo = manager.getRepository(ServiceRequest);
      const linkRepo = manager.getRepository(ServiceRequestTechnician);

      const entity = srRepo.create({
        scheduledAt,
        scheduledEndAt,
        serviceType: dto.serviceType,
        direccion: direccion.slice(0, 255),
        description: dto.description,
        stateId: 5,
        serviceId: dto.serviceId,
        clientId: dto.clientId,
      });

      const sr = await srRepo.save(entity);

      const links = technicians.map((tid) =>
        linkRepo.create({
          serviceRequestId: sr.serviceRequestId,
          technicianId: tid,
        })
      );

      await linkRepo.insert(links);

      return sr;
    });

    return this.repo.findOne({
      where: { serviceRequestId: saved.serviceRequestId },
      relations: this.relations(),
    });
  }

  async findAll() {
    return this.repo.find({
      relations: this.relations(),
      order: { serviceRequestId: "ASC" },
    });
  }

  async findOne(id: number) {
    const entity = await this.repo.findOne({
      where: { serviceRequestId: id },
      relations: this.relations(),
    });
    if (!entity) throw new NotFoundException("ServiceRequest not found");
    return entity;
  }

  async update(id: number, dto: UpdateServiceRequestDto) {
    const existing = await this.findOne(id);

    if (dto.stateId !== undefined) await this.ensureStateExists(dto.stateId);

    const nextScheduledAt =
      dto.scheduledAt === undefined ? existing.scheduledAt : toDateOrNull(dto.scheduledAt) ?? null;

    const nextScheduledEndAt =
      dto.scheduledEndAt === undefined
        ? (existing as any).scheduledEndAt ?? null
        : toDateOrNull(dto.scheduledEndAt) ?? null;

    ensureEndAfterStart(nextScheduledAt, nextScheduledEndAt);

    let direccion = existing.direccion;
    if ((dto as any).direccion !== undefined) {
      const dir = String((dto as any).direccion ?? "").trim();
      if (!dir) throw new BadRequestException("direccion should not be empty");
      if (dir.length > 255) {
        throw new BadRequestException("direccion must be shorter than or equal to 255 characters");
      }
      direccion = dir.slice(0, 255);
    }

    const patch: Partial<ServiceRequest> = {
      scheduledAt: nextScheduledAt,
      scheduledEndAt: nextScheduledEndAt as any,
      serviceType: dto.serviceType ?? existing.serviceType,
      direccion,
      description: dto.description ?? existing.description,
      serviceId: dto.serviceId ?? existing.serviceId,
      clientId: dto.clientId ?? existing.clientId,
    };

    if (dto.stateId !== undefined) patch.stateId = dto.stateId;

    await this.repo.manager.transaction(async (manager) => {
      const srRepo = manager.getRepository(ServiceRequest);
      const linkRepo = manager.getRepository(ServiceRequestTechnician);

      await srRepo.update({ serviceRequestId: id }, patch);

      if (dto.technicians !== undefined) {
        const technicians = uniqPositiveInts(dto.technicians || []);
        if (!technicians.length) throw new BadRequestException("Selecciona al menos un técnico.");

        await linkRepo.delete({ serviceRequestId: id } as any);

        const links = technicians.map((tid) =>
          linkRepo.create({
            serviceRequestId: id,
            technicianId: tid,
          })
        );

        await linkRepo.insert(links);
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensureStateExists(4);
    await this.repo.update({ serviceRequestId: id }, { stateId: 4 });
    return this.findOne(id);
  }
}
