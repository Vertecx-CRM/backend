import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";

import { ServiceRequest } from "./entities/servicerequest.entity";
import { ServiceRequestTechnician } from "./entities/servicerequest-technician.entity";
import { CreateRequestDto } from "./dto/create-request.dto";
import { UpdateServiceRequestDto } from "./dto/update-request.dto";

import { States } from "../shared/entities/states.entity";
import { Customers } from "src/customers/entities/customers.entity";
import { MailService } from "src/shared/mail/mail.service";
import { RequestQueryDto } from "./dto/request-query.dto";
import { DateUtils } from '../shared/utils/date-utils';
import { NormalizationClass } from '../shared/utils/normalization.class';
import { isCanceledState } from "../shared/utils/is-cancelled-state";
import { OrdersServices } from "../orders-services/entities/orders-services.entity";
import { ServicesService } from "../services/services.service";
import { CreateAdminRequestDto } from "./dto/create-admin-request-.dto";
import { resolveUserIdFromAuth } from "../shared/utils/resolve-user-id";
import { CustomersService } from '../customers/customers.service';

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

    private readonly servicesService: ServicesService,
    private readonly customersService: CustomersService,
    private readonly mailService: MailService
  ) {}

  private async notifyScheduled(sr: ServiceRequest) {
    try {
      if (!DateUtils.isScheduledState(sr.state?.name)) return;
      if (!sr.scheduledAt) return;

      const when = DateUtils.buildScheduleLabel(sr.scheduledAt, sr.scheduledEndAt) || sr.scheduledAt.toISOString();

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
    const { clientId, stateId, fromScheduleDate, serviceTypeId, serviceId } = query;
    const scheduledAt = !DateUtils.toDateOrNull(fromScheduleDate) ? undefined : MoreThanOrEqual(DateUtils.toDateOrNull(fromScheduleDate))

    const result = await this.srRepo.find({
      relations: {
        state: true,
        service: true,
        customer: { users: true },
        techniciansMap: { technician: { users: true } },
      },
      where: {
        clientId: clientId,
        stateId: stateId,
        scheduledAt,
        serviceId,
        service: { typeofserviceid: serviceTypeId }
      },
      order: { serviceRequestId: "ASC" },
    });

    if (!result.length)
      throw new NotFoundException('Solicitudes no encontradas')

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

  async createByAdmin(dto: CreateAdminRequestDto) {
    const { address, description, stateId, scheduledAt, scheduledEndAt } = this.getCommonFields(dto);
    const { clientId, technicians, serviceId, serviceType } = dto;

    await this.customersService.findOne(clientId);

    const normalizedTechnicians = NormalizationClass.normalizeTechnicians(technicians);

    await this.validateService(serviceId);

    const normalizedStateId = Number.isFinite(stateId) && stateId > 0 ? stateId : 5;
    const state = await this.statesRepo.findOne({
      where: { stateid: normalizedStateId } as any,
    });

    if (!state)
      throw new BadRequestException("stateId invalido");

    if (!isCanceledState(state.name))
      await this.ensureTechniciansAvailability(
        technicians,
        scheduledAt ?? null,
        scheduledEndAt ?? null
      );

    const entity = this.srRepo.create({
      scheduledAt: scheduledAt ?? null,
      scheduledEndAt: scheduledEndAt ?? null,
      serviceType,
      direccion: address,
      description,
      stateId: normalizedStateId,
      serviceId,
      clientId,
    });

    const sr = await this.srRepo.save(entity);

    const linkRows = normalizedTechnicians.map((tid) => ({
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

  async create(user: any, dto: CreateRequestDto) {
    const { serviceId } = dto
    const userId = resolveUserIdFromAuth(user);

    const customer = await this.customersRepo
      .createQueryBuilder("c")
      .leftJoin("c.users", "u")
      .where("u.userid = :userId", { userId })
      .getOne();

    if (!customer) throw new BadRequestException(
        "El usuario autenticado no tiene un cliente asociado"
      );

    const clientId = Number((customer as any)?.customerid ?? (customer as any)?.id);
    if (!Number.isFinite(clientId)) throw new BadRequestException(
        "No se pudo resolver el clientId del cliente asociado"
      );

    const { address, description, stateId, scheduledAt, scheduledEndAt } = this.getCommonFields(dto);

    await this.validateService(serviceId);

    const entity = this.srRepo.create({
      scheduledAt: scheduledAt ?? null,
      scheduledEndAt: scheduledEndAt ?? null,
      serviceType: dto.serviceType,
      direccion: address,
      description,
      stateId,
      serviceId,
      clientId,
    });

    const sr = await this.srRepo.save(entity);
    const full = await this.findOne(sr.serviceRequestId);
    await this.notifyScheduled(full);
    return full;
  }

  async validateService(id: number) {
    if (!Number.isFinite(id))
      throw new BadRequestException("serviceId invalido");

    return await this.servicesService.findOne(id);
  }

  private getCommonFields(dto: CreateRequestDto) {
    const scheduledAt = DateUtils.toDateOrNull(dto.scheduledAt);
    const scheduledEndAt = DateUtils.toDateOrNull(dto.scheduledEndAt);
    DateUtils.ensureEndAfterStart(scheduledAt ?? null, scheduledEndAt ?? null);

    const address = String(dto.address || "").trim().slice(0, 255);
    const description = String(dto.description || "").trim();
    const stateId = Number(dto?.stateId ?? 5);

    return { address, description, stateId, scheduledAt, scheduledEndAt }
  }

  async update(id: number, dto: UpdateServiceRequestDto) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    const prevStateId = sr.stateId;
    const prevStart = sr.scheduledAt ? sr.scheduledAt.getTime() : null;
    const prevEnd = sr.scheduledEndAt ? sr.scheduledEndAt.getTime() : null;

    const scheduledAt = DateUtils.toDateOrNull(dto?.scheduledAt);
    const scheduledEndAt = DateUtils.toDateOrNull(dto?.scheduledEndAt);

    const nextStart = scheduledAt === undefined ? sr.scheduledAt : scheduledAt;
    const nextEnd =
      scheduledEndAt === undefined ? sr.scheduledEndAt : scheduledEndAt;

    DateUtils.ensureEndAfterStart(nextStart ?? null, nextEnd ?? null);

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
      dto?.technicians !== undefined
        ? NormalizationClass.normalizeTechnicians(dto?.technicians)
        : currentTechs;

    const effectiveStateId = dto.stateId ?? sr.stateId;
    const effectiveState = await this.statesRepo.findOne({
      where: { stateid: effectiveStateId },
    });
    if (!effectiveState) throw new BadRequestException("stateId invalido");

    if (!isCanceledState(effectiveState.name)) {
      await this.ensureTechniciansAvailability(
        nextTechs,
        nextStart ?? null,
        nextEnd ?? null,
        { excludeRequestId: id }
      );
    }

    sr.scheduledAt = scheduledAt !== undefined ? scheduledAt : sr.scheduledAt;
    sr.scheduledEndAt = scheduledEndAt !== undefined ? scheduledEndAt : sr.scheduledEndAt;
    sr.serviceType = dto.serviceType ?? sr.serviceType;
    sr.direccion = dto.address ?? sr.direccion;
    sr.description = dto.description ?? sr.description;
    sr.stateId = effectiveStateId;
    sr.serviceId =  dto.serviceId && await this.servicesService.findOne(dto.serviceId) ? sr.serviceId : sr.serviceId;
    sr.clientId = dto.clientId &&  await this.customersService.findOne(dto.clientId) ? sr.clientId : sr.serviceId;

    await this.srRepo.save(sr);

    if (dto.technicians !== undefined) {
      const techs = NormalizationClass.normalizeTechnicians(dto?.technicians);

      await this.linkRepo.delete({ serviceRequestId: id });

      if (techs.length) {
        const linkRows = techs.map((tid) => ({
          serviceRequestId: id,
          technicianId: tid,
        }));

        await this.linkRepo.insert(linkRows);
      }
    }

    const updated = await this.findOne(id);

    const scheduleChanged =
      prevStateId !== updated.stateId ||
      prevStart !== (updated.scheduledAt ? updated.scheduledAt.getTime() : null) ||
      prevEnd !== (updated.scheduledEndAt ? updated.scheduledEndAt.getTime() : null);

    if (scheduleChanged && DateUtils.isScheduledState(updated.state?.name))
      await this.notifyScheduled(updated);

    return updated;
  }

  async remove(id: number) {
    const sr = await this.srRepo.findOne({ where: { serviceRequestId: id } });
    if (!sr) throw new NotFoundException("Solicitud no encontrada");

    await this.linkRepo.delete({ serviceRequestId: id } as any);
    await this.srRepo.delete({ serviceRequestId: id });
    return { ok: true };
  }

  private async ensureTechniciansAvailability(
    technicianIds: number[],
    start: Date | null,
    end: Date | null,
    opts?: { excludeRequestId?: number; excludeOrderId?: number }
  ) {
    if (!technicianIds.length || !start) return;
    const requested = new Set(technicianIds);
    const target = DateUtils.buildRange(start, end);
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
    
    if (!requests.length)
      throw new NotFoundException('Technicians not found')

    for (const sr of requests) {
      if (isCanceledState(sr?.state?.name)) continue;
      const range = DateUtils.buildRange(sr.scheduledAt, sr.scheduledEndAt);
      if (!range) continue;
      if (!DateUtils.hasOverlap(target.start, target.end, range.start, range.end)) continue;

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
      if (isCanceledState(o?.state?.name)) continue;

      const oStart = DateUtils.orderDateTime(o.fechainicio as any, o.horainicio);
      const oEnd = DateUtils.orderDateTime((o.fechafin ?? o.fechainicio) as any, o.horafin);
      const range = DateUtils.buildRange(oStart, oEnd);

      if (!range) continue;
      if (!DateUtils.hasOverlap(target.start, target.end, range.start, range.end)) continue;

      for (const tech of o.technicians ?? []) {
        const id = Number((tech as any)?.technicianid);
        if (requested.has(id)) conflicts.add(id);
      }
    }

    if (conflicts.size > 0) {
      const ids = Array.from(conflicts).sort((a, b) => a - b);
      throw new BadRequestException(
        `Los siguientes tecnicos ya estann ocupados en ese horario: ${ids.join(", ")}`
      );
    }
  }
}

