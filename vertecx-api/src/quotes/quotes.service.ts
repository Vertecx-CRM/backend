import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quotes } from './entities/quotes.entity';
import { QuoteDetail } from './entities/quotedetail.entity';

import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { States } from 'src/shared/entities/states.entity';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';

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
  ) {}

  /* =====================================================
     VALIDACIÓN DE REFERENCIAS
     ===================================================== */
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
      if (!sr)
        throw new BadRequestException(
          `ServiceRequest ${dto.serviceRequestId} no existe`,
        );
    }

    if (dto.customerid !== undefined) {
      const customer = await this.customersRepo.findOne({
        where: { customerid: dto.customerid },
      });
      if (!customer)
        throw new BadRequestException(`Customer ${dto.customerid} no existe`);
    }

    if (dto.technicianid !== undefined) {
      const tech = await this.techniciansRepo.findOne({
        where: { technicianid: dto.technicianid },
      });
      if (!tech)
        throw new BadRequestException(
          `Technician ${dto.technicianid} no existe`,
        );
    }

    if (dto.statesid !== undefined) {
      const state = await this.statesRepo.findOne({
        where: { stateid: dto.statesid },
      });
      if (!state)
        throw new BadRequestException(`State ${dto.statesid} no existe`);
    }

    if (dto.ordersservicesid !== undefined && dto.ordersservicesid !== null) {
      const order = await this.ordersServicesRepo.findOne({
        where: { ordersservicesid: dto.ordersservicesid },
      });
      if (!order)
        throw new BadRequestException(
          `OrdersServices ${dto.ordersservicesid} no existe`,
        );
    }
  }

  /* =====================================================
     CREATE
     ===================================================== */
  async create(dto: CreateQuoteDto) {
    await this.ensureRefs(dto);

    const quote = this.quotesRepo.create({
      serviceRequestId: dto.serviceRequestId,
      ordersservicesid: dto.ordersservicesid ?? null,
      statesid: dto.statesid,
      customerid: dto.customerid,
      technicianid: dto.technicianid,
      observation: dto.observation ?? null,
      servicetype: dto.servicetype ?? null,
      subtotal: dto.subtotal ?? null,
      tax: dto.tax ?? null,
      total: dto.total ?? null,
      details: dto.details.map((d) =>
        this.detailsRepo.create({
          productid: d.productid ?? null,
          description: d.description,
          quantity: d.quantity,
          unitprice: d.unitprice,
          subtotal: d.subtotal,
          availability: d.availability ?? 'DISPONIBLE',
        }),
      ),
    });

    const saved = await this.quotesRepo.save(quote);
    return this.findOne(saved.quotesid);
  }

  /* =====================================================
     FIND ALL
     ===================================================== */
  async findAll() {
    return this.quotesRepo.find({
      relations: {
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        details: true,
      },
      order: { createdat: 'DESC' },
    });
  }

  /* =====================================================
     FIND ONE
     ===================================================== */
  async findOne(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
      relations: {
        serviceRequest: true,
        ordersservices: true,
        state: true,
        customer: { users: true } as any,
        technician: { users: true } as any,
        details: true,
      },
    });

    if (!quote) throw new NotFoundException(`Quote ${id} no existe`);

    return quote;
  }

  /* =====================================================
     UPDATE
     ===================================================== */
  async update(id: number, dto: UpdateQuoteDto) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
      relations: { details: true },
    });

    if (!quote) throw new NotFoundException(`Quote ${id} no existe`);

    await this.ensureRefs(dto);

    Object.assign(quote, {
      serviceRequestId: dto.serviceRequestId ?? quote.serviceRequestId,
      ordersservicesid: dto.ordersservicesid ?? quote.ordersservicesid,
      statesid: dto.statesid ?? quote.statesid,
      customerid: dto.customerid ?? quote.customerid,
      technicianid: dto.technicianid ?? quote.technicianid,
      observation: dto.observation ?? quote.observation,
      servicetype: dto.servicetype ?? quote.servicetype,
      subtotal: dto.subtotal ?? quote.subtotal,
      tax: dto.tax ?? quote.tax,
      total: dto.total ?? quote.total,
    });

    if (dto.details) {
      await this.detailsRepo.delete({ quotesid: id });

      quote.details = dto.details.map((d) =>
        this.detailsRepo.create({
          quote,
          productid: d.productid ?? null,
          description: d.description,
          quantity: d.quantity,
          unitprice: d.unitprice,
          subtotal: d.subtotal,
          availability: d.availability ?? 'DISPONIBLE',
        }),
      );
    }

    await this.quotesRepo.save(quote);
    return this.findOne(id);
  }

  /* =====================================================
     REMOVE
     ===================================================== */
  async remove(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) throw new NotFoundException(`Quote ${id} no existe`);

    await this.quotesRepo.delete({ quotesid: id });
    return { message: `Quote ${id} eliminada correctamente` };
  }
}
