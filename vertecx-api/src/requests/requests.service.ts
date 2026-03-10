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
import { MailService } from "src/shared/mail/mail.service";
import { OrdersServices } from "src/orders-services/entities/orders-services.entity";
import { RequestQueryDto } from "./dto/request-query.dto";

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
    throw new BadRequestException("Fecha/hora invÃ¡lida");
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

function normalizeStateName(name?: string | null) {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildScheduleLabel(start: Date | null, end: Date | null) {
  if (!start) return "";
  const fmtDateTime = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
    timeStyle: "short",
  });
  const fmtTime = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    timeStyle: "short",
  });
  const startText = fmtDateTime.format(start);
  if (end) return `${startText} - ${fmtTime.format(end)}`;
  return startText;
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
    private readonly customersRepo: Repository<Customers>,

    @InjectRepository(OrdersServices)
    private readonly ordersRepo: Repository<OrdersServices>,

    private readonly mailService: MailService
  ) {}

  private isScheduledState(name?: string | null) {
    const norm = normalizeStateName(name);
    return norm.includes("agend");
  }

  private isCanceledState(name?: string | null) {
    const norm = normalizeStateName(name);
    return norm.includes("anul") || norm.includes("cancel");
  }

  private parseTimeToParts(raw?: string | null) {
    const txt = String(raw ?? "").trim();
    const m = txt.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ss = Number(m[3] ?? "0");
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    return { hh, mm, ss };
  }

  private toOrderDateTime(dateRaw?: Date | string | null, timeRaw?: string | null) {
    if (!dateRaw || !timeRaw) return null;
    const time = this.parseTimeToParts(timeRaw);
    if (!time) return null;
    const base = dateRaw instanceof Date ? dateRaw : new Date(String(dateRaw));
    if (!Number.isFinite(base.getTime())) return null;
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      time.hh,
      time.mm,
      time.ss,
      0
    );
  }

  private buildRange(start: Date | null, end: Date | null) {
    if (!start) return null;
    const safeEnd =
      end && Number.isFinite(end.getTime()) && end.getTime() > start.getTime()
        ? end
        : new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end: safeEnd };
  }

  private hasOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return Math.max(aStart.getTime(), bStart.getTime()) < Math.min(aEnd.getTime(), bEnd.getTime());
  }

  private async ensureTechniciansAvailability(
    technicianIds: number[],
    start: Date | null,
    end: Date | null,
    opts?: { excludeRequestId?: number; excludeOrderId?: number }
  ) {
    if (!technicianIds.length || !start) return;
    const requested = new Set(technicianIds);
    const target = this.buildRange(start, end);
    if (!target) return;

    const conflicts = new Set<number>();

    const reqQb = this.srRepo
      .createQueryBuilder("sr")
      .leftJoinAndSelect("sr.state", "state")
      .leftJoinAndSelect("sr.techniciansMap", "tm")
      .where("tm.technicianId IN (:...techIds)", { techIds: technicianIds });

    if (opts?.excludeRequestId) {
      reqQb.andWhere("sr.serviceRequestId != :excludeRequestId", {
        excludeRequestId: opts.excludeRequestId,
      });
    }

    const requests = await reqQb.getMany();
    for (const sr of requests) {
      if (this.isCanceledState(sr?.state?.name)) continue;
      const range = this.buildRange(sr.scheduledAt, sr.scheduledEndAt);
      if (!range) continue;
      if (!this.hasOverlap(target.start, target.end, range.start, range.end)) continue;

      for (const link of sr.techniciansMap ?? []) {
        const id = Number((link as any)?.technicianId);
        if (requested.has(id)) conflicts.add(id);
      }
    }

    const ordersQb = this.ordersRepo
      .createQueryBuilder("o")
      .leftJoinAndSelect("o.state", "state")
      .leftJoinAndSelect("o.technicians", "tech")
      .where("tech.technicianid IN (:...techIds)", { techIds: technicianIds });

    if (opts?.excludeOrderId) {
      ordersQb.andWhere("o.ordersservicesid != :excludeOrderId", {
        excludeOrderId: opts.excludeOrderId,
      });
    }

    const orders = await ordersQb.getMany();
    for (const o of orders) {
      if (this.isCanceledState(o?.state?.name)) continue;
      const oStart = this.toOrderDateTime(o.fechainicio as any, o.horainicio);
      const oEnd = this.toOrderDateTime((o.fechafin ?? o.fechainicio) as any, o.horafin);
      const range = this.buildRange(oStart, oEnd);
      if (!range) continue;
      if (!this.hasOverlap(target.start, target.end, range.start, range.end)) continue;

      for (const tech of o.technicians ?? []) {
        const id = Number((tech as any)?.technicianid);
        if (requested.has(id)) conflicts.add(id);
      }
    }

    if (conflicts.size > 0) {
      const ids = Array.from(conflicts).sort((a, b) => a - b);
      throw new BadRequestException(
        `Los siguientes tÃ©cnicos ya estÃ¡n ocupados en ese horario: ${ids.join(", ")}`
      );
    }
  }

  private async notifyScheduled(sr: ServiceRequest) {
    try {
      if (!this.isScheduledState(sr.state?.name)) return;
      if (!sr.scheduledAt) return;

      const when = buildScheduleLabel(sr.scheduledAt, sr.scheduledEndAt) || sr.scheduledAt.toISOString();

      const customerEmail = sr.customer?.users?.email;
      if (customerEmail) {
        const name = [sr.customer?.users?.name, sr.customer?.users?.lastname].filter(Boolean).join(" ").trim();
        await this.mailService.sendAppointmentScheduled(customerEmail, name, "solicitud de servicio", when);
      }

      const techEmails = (sr.techniciansMap ?? [])
        .map((t: any) => ({
          email: t?.technician?.users?.email,
          name: [t?.technician?.users?.name, t?.technician?.users?.lastname].filter(Boolean).join(" ").trim(),
        }))
        .filter((t: any) => t.email);

      await Promise.all(
        techEmails.map((t) =>
          this.mailService.sendAppointmentScheduled(t.email, t.name, "visita asignada", when)
        )
      );
    } catch (error) {
      // No bloquear el flujo principal por fallos de correo
      console.error("No se pudo enviar correo de agenda de solicitud:", error?.message ?? error);
    }
  }

  async findAll(query: RequestQueryDto) {
    const result = await this.srRepo.find({
      relations: {
        state: true,
        service: true,
        customer: { users: true },
        techniciansMap: { technician: { users: true } },
      },
      where: {
        clientId: query.clientId
      },
      order: { serviceRequestId: "ASC" },
    });

    // console.log(result);
    return result;
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
      throw new BadRequestException("DirecciÃ³n invÃ¡lida");
    }

    const description = String((dto as any).description || "").trim();
    if (description.length < 3) {
      throw new BadRequestException("DescripciÃ³n invÃ¡lida");
    }

    const stateId = Number((dto as any)?.stateId ?? 5);
    const serviceId = Number((dto as any)?.serviceId);
    const normalizedStateId = Number.isFinite(stateId) && stateId > 0 ? stateId : 5;
    const state = await this.statesRepo.findOne({
      where: { stateid: normalizedStateId } as any,
    });
    if (!state) throw new BadRequestException("stateId invÃ¡lido");

    if (!this.isCanceledState(state.name)) {
      await this.ensureTechniciansAvailability(
        technicians,
        scheduledAt ?? null,
        scheduledEndAt ?? null
      );
    }

    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      throw new BadRequestException("serviceId invÃ¡lido");
    }

    const entity = this.srRepo.create({
      scheduledAt: scheduledAt ?? null,
      scheduledEndAt: scheduledEndAt ?? null,
      serviceType: (dto as any).serviceType,
      direccion: direccion.slice(0, 255),
      description,
      stateId: normalizedStateId,
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

    const full = await this.findOne(sr.serviceRequestId);
    await this.notifyScheduled(full);
    return full;
  }

  async createFromAuth(user: any, dto: CreateRequestFromAuthDto) {
    const userId = resolveUserIdFromAuth(user);
    if (!userId) {
      throw new BadRequestException(
        "Token invÃ¡lido: no se pudo obtener el userid"
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
      throw new BadRequestException("DirecciÃ³n invÃ¡lida");
    }

    const description = String(dto.description || "").trim();
    if (description.length < 3) {
      throw new BadRequestException("DescripciÃ³n invÃ¡lida");
    }

    const stateId = Number(dto.stateId ?? 5);
    const serviceId = Number(dto.serviceId);

    if (!Number.isFinite(serviceId) || serviceId <= 0) {
      throw new BadRequestException("serviceId invÃ¡lido");
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
    const full = await this.findOne(sr.serviceRequestId);
    await this.notifyScheduled(full);
    return full;
  }

  async update(id: number, dto: UpdateServiceRequestDto) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    const prevStateId = sr.stateId;
    const prevStart = sr.scheduledAt ? sr.scheduledAt.getTime() : null;
    const prevEnd = sr.scheduledEndAt ? sr.scheduledEndAt.getTime() : null;

    const scheduledAt = toDateOrNull((dto as any)?.scheduledAt);
    const scheduledEndAt = toDateOrNull((dto as any)?.scheduledEndAt);

    const nextStart = scheduledAt === undefined ? sr.scheduledAt : scheduledAt;
    const nextEnd =
      scheduledEndAt === undefined ? sr.scheduledEndAt : scheduledEndAt;

    ensureEndAfterStart(nextStart ?? null, nextEnd ?? null);

    const existingLinks = await this.linkRepo.find({
      where: { serviceRequestId: id } as any,
    });
    const currentTechs = Array.from(
      new Set(
        (existingLinks ?? [])
          .map((x) => Number((x as any)?.technicianId))
          .filter((x) => Number.isFinite(x) && x > 0)
      )
    );
    const nextTechs =
      (dto as any)?.technicians !== undefined
        ? normalizeTechnicians((dto as any)?.technicians)
        : currentTechs;
    const stateIdInput = (dto as any)?.stateId;
    const effectiveStateId =
      stateIdInput != null ? Number(stateIdInput) : Number(sr.stateId);
    if (!Number.isFinite(effectiveStateId) || effectiveStateId <= 0) {
      throw new BadRequestException("stateId invÃ¡lido");
    }
    const effectiveState = await this.statesRepo.findOne({
      where: { stateid: effectiveStateId } as any,
    });
    if (!effectiveState) throw new BadRequestException("stateId invÃ¡lido");

    if (!this.isCanceledState(effectiveState.name)) {
      await this.ensureTechniciansAvailability(
        nextTechs,
        nextStart ?? null,
        nextEnd ?? null,
        { excludeRequestId: id }
      );
    }

    if (scheduledAt !== undefined) sr.scheduledAt = scheduledAt;
    if (scheduledEndAt !== undefined) sr.scheduledEndAt = scheduledEndAt;

    if ((dto as any)?.serviceType != null) {
      sr.serviceType = String((dto as any).serviceType);
    }

    if ((dto as any)?.direccion != null) {
      const dir = String((dto as any).direccion).trim();
      if (dir.length < 3) throw new BadRequestException("DirecciÃ³n invÃ¡lida");
      sr.direccion = dir.slice(0, 255);
    }

    if ((dto as any)?.description != null) {
      const desc = String((dto as any).description).trim();
      if (desc.length < 3) throw new BadRequestException("DescripciÃ³n invÃ¡lida");
      sr.description = desc;
    }

    if ((dto as any)?.stateId != null) {
      sr.stateId = effectiveStateId;
    }

    if ((dto as any)?.serviceId != null) {
      const serviceId = Number((dto as any).serviceId);
      if (!Number.isFinite(serviceId) || serviceId <= 0) {
        throw new BadRequestException("serviceId invÃ¡lido");
      }
      sr.serviceId = serviceId;
    }

    if ((dto as any)?.clientId != null) {
      const clientId = Number((dto as any).clientId);
      if (!Number.isFinite(clientId) || clientId <= 0) {
        throw new BadRequestException("clientId invÃ¡lido");
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

    const updated = await this.findOne(id);

    const scheduleChanged =
      prevStateId !== updated.stateId ||
      prevStart !== (updated.scheduledAt ? updated.scheduledAt.getTime() : null) ||
      prevEnd !== (updated.scheduledEndAt ? updated.scheduledEndAt.getTime() : null);

    if (scheduleChanged && this.isScheduledState(updated.state?.name)) {
      await this.notifyScheduled(updated);
    }

    return updated;
  }

  async remove(id: number) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    await this.linkRepo.delete({ serviceRequestId: id } as any);
    await this.srRepo.delete({ serviceRequestId: id });
    return { ok: true };
  }
}

