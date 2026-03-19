import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { Quotes } from './entities/quotes.entity';
import { QuoteDetail } from './entities/quotedetail.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { SalesService } from 'src/sales/sales.service';
import { CreateSaleDto } from 'src/sales/dto/create-sale.dto';
import { MailService } from 'src/shared/mail/mail.service';
import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { States } from 'src/shared/entities/states.entity';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';
import { Products } from 'src/products/entities/products.entity';
import { resolveUserIdFromAuth } from 'src/shared/utils/resolve-user-id';

const QUOTE_APPROVED_STATE_ID = 3;
const QUOTE_CLIENT_CANCELED_STATE_ID = 4;
const QUOTE_PENDING_STATE_ID = 5;
const QUOTE_COMPLETED_STATE_FALLBACK_ID = 6;
const QUOTE_REVOKED_STATE_ID = 8;
const ORDER_FINISHED_STATE_ID = 6;
const CLIENT_ACCEPTED_MARKER = '[CLIENT_ACCEPTED=true]';
const CLIENT_ACCEPTED_AT_PREFIX = '[CLIENT_ACCEPTED_AT=';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quotes)
    private readonly quotesRepo: Repository<Quotes>,

    @InjectRepository(QuoteDetail)
    private readonly detailsRepo: Repository<QuoteDetail>,

    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepo: Repository<ServiceRequest>,

    @InjectRepository(Customers)
    private readonly customersRepo: Repository<Customers>,

    @InjectRepository(Technicians)
    private readonly techniciansRepo: Repository<Technicians>,

    @InjectRepository(States)
    private readonly statesRepo: Repository<States>,

    @InjectRepository(OrdersServices)
    private readonly ordersServicesRepo: Repository<OrdersServices>,

    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    private readonly salesService: SalesService,
    private readonly mailService: MailService,
  ) {}

  private completedStateIdCache: number | null = null;

  private normalizeRoleName(role?: string | null) {
    return String(role ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private normalizeText(value?: string | null) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private getScopedWhereForUser(
    user: any,
  ): FindOptionsWhere<Quotes> | undefined {
    if (this.normalizeRoleName(user?.rolename) !== 'cliente') {
      return undefined;
    }

    return {
      customer: {
        userid: resolveUserIdFromAuth(user),
      } as any,
    };
  }

  private isCompletedState(stateId?: number | null) {
    return (
      Number(stateId ?? 0) ===
      Number(this.completedStateIdCache ?? QUOTE_COMPLETED_STATE_FALLBACK_ID)
    );
  }

  private isCanceledLike(stateId?: number | null) {
    const normalized = Number(stateId ?? 0);
    return (
      normalized === QUOTE_CLIENT_CANCELED_STATE_ID ||
      normalized === QUOTE_REVOKED_STATE_ID
    );
  }

  private isFinishedLikeStateName(stateName?: string | null) {
    const normalized = this.normalizeText(stateName);
    return (
      normalized.includes('finish') ||
      normalized.includes('finaliz') ||
      normalized.includes('complet')
    );
  }

  private extractObservationMeta(observation?: string | null) {
    const raw = String(observation ?? '');
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    let clientAccepted = false;
    let clientAcceptedAt: string | null = null;
    const cleanLines: string[] = [];

    for (const line of lines) {
      if (line === CLIENT_ACCEPTED_MARKER) {
        clientAccepted = true;
        continue;
      }

      if (line.startsWith(CLIENT_ACCEPTED_AT_PREFIX) && line.endsWith(']')) {
        clientAccepted = true;
        const iso = line.slice(CLIENT_ACCEPTED_AT_PREFIX.length, -1).trim();
        clientAcceptedAt = iso || null;
        continue;
      }

      cleanLines.push(line);
    }

    return {
      observationPlain: cleanLines.join('\n').trim(),
      clientAccepted,
      clientAcceptedAt,
    };
  }

  private buildObservation(
    observationPlain?: string | null,
    meta?: { clientAccepted?: boolean; clientAcceptedAt?: string | null },
  ) {
    const lines: string[] = [];
    const clean = String(observationPlain ?? '').trim();
    if (clean) lines.push(clean);

    if (meta?.clientAccepted) {
      lines.push(CLIENT_ACCEPTED_MARKER);
      if (meta.clientAcceptedAt) {
        lines.push(`${CLIENT_ACCEPTED_AT_PREFIX}${meta.clientAcceptedAt}]`);
      }
    }

    return lines.join('\n').trim() || null;
  }

  private decorateQuote<T extends Quotes | null>(quote: T) {
    if (!quote) return quote;

    const meta = this.extractObservationMeta((quote as any)?.observation);
    return Object.assign(quote as any, {
      observation: meta.observationPlain,
      observationPlain: meta.observationPlain,
      clientAccepted: meta.clientAccepted,
      clientAcceptedAt: meta.clientAcceptedAt,
    });
  }

  private decorateQuotes<T extends Quotes[]>(quotes: T) {
    return (quotes ?? []).map((quote) => this.decorateQuote(quote));
  }

  private async findExistingActiveQuoteForRequest(serviceRequestId: number) {
    const existing = await this.quotesRepo.find({
      where: { serviceRequestId },
      order: { quotesid: 'DESC' },
    });

    return existing.find(
      (quote) =>
        !this.isCanceledLike(quote.statesid) &&
        !this.isCompletedState(quote.statesid),
    );
  }

  private async notifyQuoteCreated(quote: any) {
    try {
      const customerEmail = String(quote?.customer?.users?.email ?? '').trim();
      const customerName = [
        quote?.customer?.users?.name,
        quote?.customer?.users?.lastname,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
      const technicianName = [
        quote?.technician?.users?.name,
        quote?.technician?.users?.lastname,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (customerEmail) {
        await this.mailService.sendQuoteCreated(
          customerEmail,
          customerName,
          quote,
          'cliente',
          technicianName,
        );
      }

      const adminEmail = String(process.env.MAIL_USER ?? '').trim();
      if (adminEmail) {
        await this.mailService.sendQuoteCreated(
          adminEmail,
          'equipo administrativo',
          quote,
          'admin',
          technicianName,
        );
      }
    } catch (error) {
      console.error(
        'No se pudo enviar el correo de nueva cotizacion:',
        (error as any)?.message ?? error,
      );
    }
  }

  private async ensureRefs(dto: {
    serviceRequestId?: number;
    customerid?: number;
    technicianid?: number;
    statesid?: number;
    ordersservicesid?: number | null;
  }) {
    if (dto.serviceRequestId !== undefined) {
      const sr = await this.serviceRequestRepo.findOne({
        where: { serviceRequestId: dto.serviceRequestId },
      });
      if (!sr) {
        throw new BadRequestException(
          `ServiceRequest ${dto.serviceRequestId} no existe`,
        );
      }
    }

    if (dto.customerid !== undefined) {
      const customer = await this.customersRepo.findOne({
        where: { customerid: dto.customerid },
      });
      if (!customer) {
        throw new BadRequestException(`Customer ${dto.customerid} no existe`);
      }
    }

    if (dto.technicianid !== undefined) {
      const tech = await this.techniciansRepo.findOne({
        where: { technicianid: dto.technicianid },
      });
      if (!tech) {
        throw new BadRequestException(
          `Technician ${dto.technicianid} no existe`,
        );
      }
    }

    if (dto.statesid !== undefined) {
      const state = await this.statesRepo.findOne({
        where: { stateid: dto.statesid },
      });
      if (!state) {
        throw new BadRequestException(`State ${dto.statesid} no existe`);
      }
    }

    if (dto.ordersservicesid !== undefined && dto.ordersservicesid !== null) {
      const order = await this.ordersServicesRepo.findOne({
        where: { ordersservicesid: dto.ordersservicesid },
      });
      if (!order) {
        throw new BadRequestException(
          `OrdersServices ${dto.ordersservicesid} no existe`,
        );
      }
    }
  }

  private async resolveCompletedStateId(): Promise<number> {
    if (this.completedStateIdCache) return this.completedStateIdCache;

    const envId =
      Number(
        process.env.QUOTE_COMPLETED_STATE_ID ??
          process.env.QUOTE_COMPLETE_STATE_ID ??
          QUOTE_COMPLETED_STATE_FALLBACK_ID,
      ) || 0;

    const explicit =
      envId > 0
        ? await this.statesRepo.findOne({
            where: { stateid: envId },
          })
        : undefined;

    if (explicit) {
      this.completedStateIdCache = explicit.stateid;
      return explicit.stateid;
    }

    const states = await this.statesRepo.find();
    const candidate = states.find((state) =>
      this.isFinishedLikeStateName(state?.name),
    );

    if (candidate) {
      this.completedStateIdCache = candidate.stateid;
      return candidate.stateid;
    }

    throw new BadRequestException(
      'No se encontro un estado de cotizacion completado configurado.',
    );
  }

  private buildSalePayloadFromQuote(quote: Quotes, metaObservation?: string | null) {
    const details = quote.details ?? [];

    const noteParts = [
      String(metaObservation ?? '').trim(),
      `Cotizacion #${quote.quotesid}`,
      quote.ordersservicesid
        ? `Orden de servicio #${quote.ordersservicesid}`
        : null,
    ].filter(Boolean);

    return {
      subtotal: Number(quote.subtotal ?? 0),
      taxamount: Number(quote.tax ?? 0),
      discountamount: 0,
      totalamount: Number(quote.total ?? 0),
      saledate: new Date().toISOString(),
      customerid: quote.customerid,
      salecode: `COT-${quote.quotesid}-${Date.now()}`,
      notes: noteParts.join(' | ') || undefined,
      paymentmethod: 'Transfer',
      salestatus: 'Pending',
      details: details.map((detail) => {
        const unitprice = Number(detail.unitprice ?? 0);
        const quantity = Math.max(1, Math.round(Number(detail.quantity ?? 0)));

        return {
          productid: detail.productid!,
          quantity,
          unitprice,
          discountpercent: 0,
          notes: detail.description ?? undefined,
          servicerequestid: quote.serviceRequestId,
        };
      }),
      taxpercent: 19,
    } as CreateSaleDto;
  }

  async create(dto: CreateQuoteDto) {
    const serviceRequest = await this.serviceRequestRepo.findOne({
      where: { serviceRequestId: dto.serviceRequestId },
      relations: {
        customer: { users: true } as any,
        techniciansMap: { technician: { users: true } } as any,
        service: { typeofservice: true } as any,
      },
    });

    if (!serviceRequest) {
      throw new BadRequestException(
        `ServiceRequest ${dto.serviceRequestId} no existe`,
      );
    }

    const existingQuote = await this.findExistingActiveQuoteForRequest(
      dto.serviceRequestId,
    );
    if (existingQuote) {
      throw new BadRequestException(
        `La solicitud ${dto.serviceRequestId} ya tiene una cotizacion activa.`,
      );
    }

    const customerId = serviceRequest.clientId;

    const technicianMap = serviceRequest.techniciansMap?.[0];
    if (!technicianMap) {
      throw new BadRequestException(
        `La solicitud ${dto.serviceRequestId} no tiene tecnico asignado`,
      );
    }

    const technicianId = technicianMap.technicianId;

    const detailsCalculated = await Promise.all(
      dto.details.map(async (detail) => {
        const quantity = Number(detail.quantity);
        if (quantity <= 0) {
          throw new BadRequestException('Cantidad invalida');
        }

        let unitprice: number;

        if (detail.productId) {
          const product = await this.productsRepo.findOne({
            where: { productid: detail.productId },
          });

          if (!product) {
            throw new BadRequestException(
              `Producto ${detail.productId} no existe`,
            );
          }

          unitprice = Number(product.productpriceofsale);
        } else {
          if (detail.unitPrice == null) {
            throw new BadRequestException(
              'Precio invalido para producto manual',
            );
          }
          unitprice = Number(detail.unitPrice);
        }

        const subtotal = Number((unitprice * quantity).toFixed(2));

        return {
          ...detail,
          unitprice,
          subtotal,
        };
      }),
    );

    const subtotalGeneral = detailsCalculated.reduce(
      (acc, detail) => acc + detail.subtotal,
      0,
    );

    const tax = Number((subtotalGeneral * 0.19).toFixed(2));
    const total = Number((subtotalGeneral + tax).toFixed(2));

    const quote = this.quotesRepo.create({
      serviceRequestId: dto.serviceRequestId,
      ordersservicesid: dto.ordersServicesId ?? null,
      statesid:
        Number(dto.statesId ?? 0) > 0
          ? Number(dto.statesId)
          : QUOTE_PENDING_STATE_ID,
      customerid: customerId,
      technicianid: technicianId,
      observation: this.buildObservation(dto.observation ?? null),
      servicetype: dto.serviceType ?? serviceRequest.serviceType,
      subtotal: subtotalGeneral,
      tax,
      total,
      details: detailsCalculated.map((detail) =>
        this.detailsRepo.create({
          productid: detail.productId ?? null,
          description: detail.description,
          quantity: detail.quantity,
          unitprice: detail.unitprice,
          subtotal: detail.subtotal,
          availability: detail.availability ?? 'DISPONIBLE',
        }),
      ),
    });

    const saved = await this.quotesRepo.save(quote);
    const created = await this.findOne(saved.quotesid);
    await this.notifyQuoteCreated(created);
    return created;
  }

  async findAll() {
    const list = await this.quotesRepo.find({
      relations: {
        serviceRequest: true,
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        ordersservices: { state: true } as any,
        details: true,
      },
      order: { createdat: 'DESC' },
    });
    return this.decorateQuotes(list as any);
  }

  async findAllForUser(user: any) {
    const list = await this.quotesRepo.find({
      where: this.getScopedWhereForUser(user),
      relations: {
        serviceRequest: true,
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        ordersservices: { state: true } as any,
        details: true,
      },
      order: { createdat: 'DESC' },
    });
    return this.decorateQuotes(list as any);
  }

  async findOne(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
      relations: {
        serviceRequest: true,
        ordersservices: { state: true } as any,
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        details: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${id} no existe`);
    }

    return this.decorateQuote(quote as any);
  }

  async findOneForUser(user: any, id: number) {
    const scopedWhere = this.getScopedWhereForUser(user);
    const quote = await this.quotesRepo.findOne({
      where: scopedWhere ? { quotesid: id, ...scopedWhere } : { quotesid: id },
      relations: {
        serviceRequest: true,
        ordersservices: { state: true } as any,
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        details: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${id} no existe`);
    }

    return this.decorateQuote(quote as any);
  }

  async remove(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${id} no existe`);
    }

    await this.quotesRepo.delete({ quotesid: id });
    return { message: `Quote ${id} eliminada correctamente` };
  }

  async cancel(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada');
    }

    if (quote.statesid === QUOTE_REVOKED_STATE_ID) {
      throw new BadRequestException('La cotizacion ya esta anulada.');
    }

    if (quote.statesid !== QUOTE_APPROVED_STATE_ID) {
      throw new BadRequestException(
        'Solo se pueden anular cotizaciones aprobadas.',
      );
    }

    const meta = this.extractObservationMeta(quote.observation);

    await this.quotesRepo.update(
      { quotesid: id },
      {
        statesid: QUOTE_REVOKED_STATE_ID,
        updatedat: new Date(),
        observation: this.buildObservation(
          observation ?? meta.observationPlain,
          meta,
        ),
      },
    );

    return this.findOne(id);
  }

  async approve(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada');
    }

    if (quote.statesid === QUOTE_APPROVED_STATE_ID) {
      throw new BadRequestException('La cotizacion ya esta aprobada.');
    }

    if (quote.statesid === QUOTE_REVOKED_STATE_ID) {
      throw new BadRequestException(
        'No se puede aprobar una cotizacion anulada.',
      );
    }

    if (quote.statesid === QUOTE_CLIENT_CANCELED_STATE_ID) {
      throw new BadRequestException(
        'No se puede aprobar una cotizacion cancelada por el cliente.',
      );
    }

    const meta = this.extractObservationMeta(quote.observation);
    if (!meta.clientAccepted) {
      throw new BadRequestException(
        'El cliente debe aceptar la cotizacion antes de aprobarla.',
      );
    }

    await this.quotesRepo.update(
      { quotesid: id },
      {
        statesid: QUOTE_APPROVED_STATE_ID,
        updatedat: new Date(),
        observation: this.buildObservation(
          observation ?? meta.observationPlain,
          meta,
        ),
      },
    );

    return this.findOne(id);
  }

  async cancelForClient(user: any, id: number, observation?: string) {
    if (this.normalizeRoleName(user?.rolename) !== 'cliente') {
      throw new ForbiddenException(
        'Solo los clientes pueden cancelar sus propias cotizaciones.',
      );
    }

    await this.findOneForUser(user, id);

    const scopedWhere = this.getScopedWhereForUser(user);
    const quote = await this.quotesRepo.findOne({
      where: scopedWhere ? { quotesid: id, ...scopedWhere } : { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada');
    }

    if (quote.statesid === QUOTE_CLIENT_CANCELED_STATE_ID) {
      throw new BadRequestException('La cotizacion ya esta cancelada.');
    }

    if (quote.statesid === QUOTE_APPROVED_STATE_ID) {
      throw new BadRequestException(
        'No se puede cancelar una cotizacion aprobada.',
      );
    }

    if (quote.statesid === QUOTE_REVOKED_STATE_ID) {
      throw new BadRequestException(
        'No se puede cancelar una cotizacion anulada.',
      );
    }

    if (this.isCompletedState(quote.statesid)) {
      throw new BadRequestException(
        'No se puede cancelar una cotizacion completada.',
      );
    }

    const meta = this.extractObservationMeta(quote.observation);

    await this.quotesRepo.update(
      { quotesid: id },
      {
        statesid: QUOTE_CLIENT_CANCELED_STATE_ID,
        updatedat: new Date(),
        observation: this.buildObservation(
          observation ?? meta.observationPlain,
          meta,
        ),
      },
    );

    return this.findOneForUser(user, id);
  }

  async acceptForClient(user: any, id: number, observation?: string) {
    if (this.normalizeRoleName(user?.rolename) !== 'cliente') {
      throw new ForbiddenException(
        'Solo los clientes pueden aceptar sus propias cotizaciones.',
      );
    }

    await this.findOneForUser(user, id);

    const scopedWhere = this.getScopedWhereForUser(user);
    const quote = await this.quotesRepo.findOne({
      where: scopedWhere ? { quotesid: id, ...scopedWhere } : { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada');
    }

    if (quote.statesid === QUOTE_APPROVED_STATE_ID) {
      throw new BadRequestException('La cotizacion ya fue aprobada.');
    }

    if (
      this.isCanceledLike(quote.statesid) ||
      this.isCompletedState(quote.statesid)
    ) {
      throw new BadRequestException(
        'La cotizacion ya no esta disponible para aceptacion.',
      );
    }

    const meta = this.extractObservationMeta(quote.observation);
    if (meta.clientAccepted) {
      return this.findOneForUser(user, id);
    }

    await this.quotesRepo.update(
      { quotesid: id },
      {
        updatedat: new Date(),
        observation: this.buildObservation(
          observation ?? meta.observationPlain,
          {
            ...meta,
            clientAccepted: true,
            clientAcceptedAt: new Date().toISOString(),
          },
        ),
      },
    );

    return this.findOneForUser(user, id);
  }

  async linkOrder(id: number, ordersServicesId: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada');
    }

    if (
      this.isCanceledLike(quote.statesid) ||
      this.isCompletedState(quote.statesid)
    ) {
      throw new BadRequestException(
        'La cotizacion no puede vincularse a una orden en su estado actual.',
      );
    }

    await this.ensureRefs({ ordersservicesid: ordersServicesId });

    await this.quotesRepo.update(
      { quotesid: id },
      {
        ordersservicesid: ordersServicesId,
        updatedat: new Date(),
      },
    );

    return this.findOne(id);
  }

  async complete(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
      relations: ['details', 'ordersservices', 'ordersservices.state'],
    });

    if (!quote) {
      throw new NotFoundException('Cotizacion no encontrada.');
    }

    const completedStateId = await this.resolveCompletedStateId();

    if (quote.statesid === completedStateId) {
      throw new BadRequestException('La cotizacion ya fue completada.');
    }

    if (this.isCanceledLike(quote.statesid)) {
      throw new BadRequestException(
        'No se puede completar una cotizacion cancelada o anulada.',
      );
    }

    if (quote.statesid !== QUOTE_APPROVED_STATE_ID) {
      throw new BadRequestException(
        'Solo cotizaciones aprobadas pueden convertirse en ventas.',
      );
    }

    if (!quote.ordersservicesid) {
      throw new BadRequestException(
        'La cotizacion debe estar vinculada a una orden de servicio antes de generar la venta.',
      );
    }

    const orderStateId = Number(quote.ordersservices?.state?.stateid ?? 0);
    const orderStateName = this.normalizeText(quote.ordersservices?.state?.name);
    if (
      orderStateId !== ORDER_FINISHED_STATE_ID &&
      !this.isFinishedLikeStateName(orderStateName)
    ) {
      throw new BadRequestException(
        'La orden de servicio asociada todavia no esta finalizada.',
      );
    }

    const details = quote.details ?? [];
    if (!details.length) {
      throw new BadRequestException(
        'La cotizacion no tiene productos para generar la venta.',
      );
    }

    for (const detail of details) {
      if (!detail.productid) {
        throw new BadRequestException(
          'Todos los detalles deben estar asociados a un producto para convertir la cotizacion en venta.',
        );
      }
    }

    const meta = this.extractObservationMeta(quote.observation);
    const salePayload = this.buildSalePayloadFromQuote(
      quote,
      meta.observationPlain,
    );
    const sale = await this.salesService.create(salePayload);

    await this.quotesRepo.update(
      { quotesid: id },
      {
        statesid: completedStateId,
        updatedat: new Date(),
        observation: this.buildObservation(meta.observationPlain, meta),
      },
    );

    const refreshed = await this.findOne(id);
    return { quote: refreshed, sale };
  }

  async completeFromOrder(orderId: number) {
    const quote = await this.quotesRepo.findOne({
      where: { ordersservicesid: orderId },
      order: { quotesid: 'DESC' },
    });

    if (!quote) return null;

    if (
      this.isCanceledLike(quote.statesid) ||
      this.isCompletedState(quote.statesid)
    ) {
      return null;
    }

    if (quote.statesid !== QUOTE_APPROVED_STATE_ID) {
      return null;
    }

    return this.complete(quote.quotesid);
  }
}
