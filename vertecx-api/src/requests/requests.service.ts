import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ServiceRequest } from "./entities/servicerequest.entity";
import { ServiceRequestTechnician } from "./entities/servicerequest-technician.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateServiceRequestDto } from "./dto/update-request.dto";
import { CreateRequestFromAuthDto } from "./dto/create-request-from-auth.dto";

import { States } from "../shared/entities/states.entity";
import { Customers } from "src/customers/entities/customers.entity";

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
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException("Fecha/hora inválida");
  }
  return d;
}

function ensureEndAfterStart(start: Date | null, end: Date | null) {
  if (start && end && end.getTime() <= start.getTime()) {
    throw new BadRequestException(
      "La hora final debe ser mayor a la hora inicial"
    );
  }
}

function normalizeTechnicians(input: any): number[] {
  const raw = Array.isArray(input) ? input : [];
  const flat = raw.flatMap((x: any) => (Array.isArray(x) ? x : [x]));
  const ids = flat
    .map((t: any) => Number(t))
    .filter((n: number) => Number.isFinite(n) && n > 0);
  return Array.from(new Set(ids));
}

function resolveUserIdFromAuth(user: any): number {
  const candidates = [user?.userid, user?.id, user?.sub];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly srRepo: Repository<ServiceRequest>,

    @InjectRepository(ServiceRequestTechnician)
    private readonly linkRepo: Repository<ServiceRequestTechnician>,

    @InjectRepository(States)
    private readonly statesRepo: Repository<States>,

    @InjectRepository(Customers)
    private readonly customersRepo: Repository<Customers>
  ) {}

  async findAll() {
    return this.srRepo.find({
      relations: {
        state: true,
        service: true,
        customer: { users: true },
        techniciansMap: { technician: { users: true } },
      },
      order: { serviceRequestId: "ASC" },
    });
  }

  async findOne(id: number) {
    const sr = await this.srRepo.findOne({
      where: { serviceRequestId: id },
      relations: {
        state: true,
        service: true,
        customer: { users: true },
        techniciansMap: { technician: { users: true } },
      },
    });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");
    return sr;
  }

  async findAllStates() {
    return this.statesRepo.find({ order: { stateid: "ASC" as any } as any });
  }

  async create(dto: CreateRequestDto) {
    const scheduledAt = toDateOrNull((dto as any).scheduledAt);
    const scheduledEndAt = toDateOrNull((dto as any).scheduledEndAt);
    ensureEndAfterStart(scheduledAt ?? null, scheduledEndAt ?? null);

    const clientId = Number((dto as any)?.clientId);
    if (!Number.isFinite(clientId) || clientId <= 0) {
      throw new BadRequestException("clientId must not be less than 1");
    }

    const technicians = normalizeTechnicians((dto as any)?.technicians);
    if (!technicians.length) {
      throw new BadRequestException("technicians should not be empty");
    }

    const direccion = String((dto as any).direccion || "").trim();
    if (direccion.length < 3) {
      throw new BadRequestException("Dirección inválida");
    }

    const description = String((dto as any).description || "").trim();
    if (description.length < 3) {
      throw new BadRequestException("Descripción inválida");
    }

    const stateId = Number((dto as any)?.stateId ?? 5);
    const serviceId = Number((dto as any)?.serviceId);

    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      throw new BadRequestException("serviceId inválido");
    }

    const entity = this.srRepo.create({
      scheduledAt: scheduledAt ?? null,
      scheduledEndAt: scheduledEndAt ?? null,
      serviceType: (dto as any).serviceType,
      direccion: direccion.slice(0, 255),
      description,
      stateId: Number.isFinite(stateId) && stateId > 0 ? stateId : 5,
      serviceId,
      clientId,
    });

    const sr = await this.srRepo.save(entity);

    const linkRows = technicians.map((tid) => ({
      serviceRequestId: sr.serviceRequestId,
      technicianId: tid,
    }));

    if (linkRows.length) {
      await this.linkRepo.insert(linkRows as any);
    }

    return this.findOne(sr.serviceRequestId);
  }

  async createFromAuth(user: any, dto: CreateRequestFromAuthDto) {
    const userId = resolveUserIdFromAuth(user);
    if (!userId) {
      throw new BadRequestException(
        "Token inválido: no se pudo obtener el userid"
      );
    }

    const customer = await this.customersRepo
      .createQueryBuilder("c")
      .leftJoin("c.users", "u")
      .where("u.userid = :userId", { userId })
      .getOne();

    if (!customer) {
      throw new BadRequestException(
        "El usuario autenticado no tiene un cliente asociado"
      );
    }

    const clientId = Number((customer as any)?.customerid ?? (customer as any)?.id);
    if (!Number.isFinite(clientId) || clientId <= 0) {
      throw new BadRequestException(
        "No se pudo resolver el clientId del cliente asociado"
      );
    }

    const scheduledAt = toDateOrNull(dto.scheduledAt);
    const scheduledEndAt = toDateOrNull(dto.scheduledEndAt);
    ensureEndAfterStart(scheduledAt ?? null, scheduledEndAt ?? null);

    const direccion = String(dto.direccion || "").trim();
    if (direccion.length < 3) {
      throw new BadRequestException("Dirección inválida");
    }

    const description = String(dto.description || "").trim();
    if (description.length < 3) {
      throw new BadRequestException("Descripción inválida");
    }

    const stateId = Number(dto.stateId ?? 5);
    const serviceId = Number(dto.serviceId);

    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      throw new BadRequestException("serviceId inválido");
    }

    const entity = this.srRepo.create({
      scheduledAt: scheduledAt ?? null,
      scheduledEndAt: scheduledEndAt ?? null,
      serviceType: dto.serviceType,
      direccion: direccion.slice(0, 255),
      description,
      stateId: Number.isFinite(stateId) && stateId > 0 ? stateId : 5,
      serviceId,
      clientId,
    });

    const sr = await this.srRepo.save(entity);
    return this.findOne(sr.serviceRequestId);
  }

  async update(id: number, dto: UpdateServiceRequestDto) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    const scheduledAt = toDateOrNull((dto as any)?.scheduledAt);
    const scheduledEndAt = toDateOrNull((dto as any)?.scheduledEndAt);

    const nextStart = scheduledAt === undefined ? sr.scheduledAt : scheduledAt;
    const nextEnd =
      scheduledEndAt === undefined ? sr.scheduledEndAt : scheduledEndAt;

    ensureEndAfterStart(nextStart ?? null, nextEnd ?? null);

    if (scheduledAt !== undefined) sr.scheduledAt = scheduledAt;
    if (scheduledEndAt !== undefined) sr.scheduledEndAt = scheduledEndAt;

    if ((dto as any)?.serviceType != null) {
      sr.serviceType = String((dto as any).serviceType);
    }

    if ((dto as any)?.direccion != null) {
      const dir = String((dto as any).direccion).trim();
      if (dir.length < 3) throw new BadRequestException("Dirección inválida");
      sr.direccion = dir.slice(0, 255);
    }

    if ((dto as any)?.description != null) {
      const desc = String((dto as any).description).trim();
      if (desc.length < 3) throw new BadRequestException("Descripción inválida");
      sr.description = desc;
    }

    if ((dto as any)?.stateId != null) {
      const stateId = Number((dto as any).stateId);
      if (!Number.isFinite(stateId) || stateId <= 0) {
        throw new BadRequestException("stateId inválido");
      }
      sr.stateId = stateId;
    }

    if ((dto as any)?.serviceId != null) {
      const serviceId = Number((dto as any).serviceId);
      if (!Number.isFinite(serviceId) || serviceId <= 0) {
        throw new BadRequestException("serviceId inválido");
      }
      sr.serviceId = serviceId;
    }

    if ((dto as any)?.clientId != null) {
      const clientId = Number((dto as any).clientId);
      if (!Number.isFinite(clientId) || clientId <= 0) {
        throw new BadRequestException("clientId inválido");
      }
      sr.clientId = clientId;
    }

    await this.srRepo.save(sr);

    if ((dto as any)?.technicians !== undefined) {
      const techs = normalizeTechnicians((dto as any)?.technicians);

      await this.linkRepo.delete({ serviceRequestId: id } as any);

      if (techs.length) {
        const linkRows = techs.map((tid) => ({
          serviceRequestId: id,
          technicianId: tid,
        }));

        await this.linkRepo.insert(linkRows as any);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    await this.linkRepo.delete({ serviceRequestId: id } as any);
    await this.srRepo.delete({ serviceRequestId: id });
    return { ok: true };
  }
}
