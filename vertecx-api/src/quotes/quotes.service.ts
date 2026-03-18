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
import { SalesService } from 'src/sales/sales.service';
import { CreateSaleDto } from 'src/sales/dto/create-sale.dto';

import { ServiceRequest } from 'src/requests/entities/servicerequest.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { Technicians } from 'src/technicians/entities/technicians.entity';
import { States } from 'src/shared/entities/states.entity';
import { OrdersServices } from 'src/orders-services/entities/orders-services.entity';
import { ProductsService } from '../products/products.service';

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

    private readonly productsService: ProductsService,
    private readonly salesService: SalesService,
  ) {}

  private completedStateIdCache: number | null = null;

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

  private async resolveCompletedStateId(): Promise<number> {
    if (this.completedStateIdCache) return this.completedStateIdCache;

    const envId =
      Number(
        process.env.QUOTE_COMPLETED_STATE_ID ??
          process.env.QUOTE_COMPLETE_STATE_ID ??
          6,
      ) || 0;

    const explicit = envId > 0 ? await this.statesRepo.findOne({
      where: { stateid: envId },
    }) : undefined;

    if (explicit) {
      this.completedStateIdCache = explicit.stateid;
      return explicit.stateid;
    }

    const states = await this.statesRepo.find();
    const candidate = states.find(
      (state) => typeof state.name === 'string' && /complet/i.test(state.name),
    );

    if (candidate) {
      this.completedStateIdCache = candidate.stateid;
      return candidate.stateid;
    }

    throw new BadRequestException(
      'No se encontró un estado de cotización completado configurado.',
    );
  }

  async create(dto: CreateQuoteDto) {
    const serviceRequest = await this.serviceRequestRepo.findOne({
      where: { serviceRequestId: dto.serviceRequestId },
      relations: {
        customer: true,
        techniciansMap: { technician: true },
      },
    });

    if (!serviceRequest) throw new BadRequestException(
        `ServiceRequest ${dto.serviceRequestId} no existe`,
      );

    const customerId = serviceRequest.clientId;

    const technicianMap = serviceRequest.techniciansMap?.[0];
    if (!technicianMap)
      throw new BadRequestException(
        `La solicitud ${dto.serviceRequestId} no tiene técnico asignado`,
      );

    const technicianId = technicianMap.technicianId;

    const detailsCalculated = await Promise.all(
      dto.details.map(async (d) => {
        const quantity = d.quantity;
        let unitprice: number;

        // PRODUCTO EXISTENTE → PRECIO REAL DE VENTA
        const product = d.productId ? await this.productsService.findOne(d.productId) : undefined;
        unitprice = product.productpriceofsale ?? null;

        //  PRODUCTO MANUAL
        if (!d.unitPrice)
          unitprice = d.unitPrice;

        const subtotal = Number((unitprice * quantity).toFixed(2));

        return {
          ...d,
          unitprice,
          subtotal,
        };
      }),
    );

    const subtotalGeneral = detailsCalculated.reduce(
      (acc, d) => acc + d.subtotal,
      0,
    );

    const tax = Number((subtotalGeneral * 0.19).toFixed(2));
    const total = Number((subtotalGeneral + tax).toFixed(2));

    const quote = this.quotesRepo.create({
      serviceRequestId: dto.serviceRequestId,
      ordersservicesid: dto.ordersServicesId ?? null,
      statesid: dto.statesId,
      customerid: customerId,
      technicianid: technicianId,
      observation: dto.observation ?? null,
      servicetype: dto.serviceType ?? serviceRequest.serviceType,

      subtotal: subtotalGeneral,
      tax,
      total,

      details: detailsCalculated.map((d) =>
        this.detailsRepo.create({
          productid: d.productId ?? null,
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

  async remove(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) throw new NotFoundException(`Quote ${id} no existe`);

    await this.quotesRepo.delete({ quotesid: id });
    return { message: `Quote ${id} eliminada correctamente` };
  }

  async cancel(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) throw new NotFoundException('Cotización no encontrada');
    

    // Ya anulada
    if (quote.statesid === 8) throw new BadRequestException('La cotización ya está anulada.');
    

    // Solo se permite anular si está aprobada
    if (quote.statesid !== 3) throw new BadRequestException(
        'Solo se pueden anular cotizaciones aprobadas.',
      );

    const updateData: Partial<Quotes> = {
      statesid: 8, // ANULADA
      updatedat: new Date(),
    };

    if (observation) {
      updateData.observation = observation;
    }

    await this.quotesRepo.update({ quotesid: id }, updateData);

    return await this.findOne(id);
  }

  async approve(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Ya aprobada
    if (quote.statesid === 3) throw new BadRequestException('La cotización ya está aprobada.');

    // No se puede aprobar si está anulada
    if (quote.statesid === 8) throw new BadRequestException(
        'No se puede aprobar una cotización anulada.',
      );

    const updateData: Partial<Quotes> = {
      statesid: 3, // APROBADA
      updatedat: new Date(),
    };

    if (observation) {
      updateData.observation = observation;
    }

    await this.quotesRepo.update({ quotesid: id }, updateData);

    return this.findOne(id);
  }

  async cancelForClient(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });
    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Ya esta cancelada
    if (quote.statesid === 4)  throw new BadRequestException('La cotización ya está cancelada.');

    // No se puede cancelar si esta aprovada
    if (quote.statesid === 3) throw new BadRequestException(
        'No se puede cancelar una cotización aprovada.',
      );

    // No se puede cancelar si esta anulada
    if (quote.statesid === 8) throw new BadRequestException(
        'No se puede cancelar una cotización anulada.',
      );

    const updateData: Partial<Quotes> = {
      statesid: 4, // APROBADA
      updatedat: new Date(),
    };

    await this.quotesRepo.update({ quotesid: id }, updateData);

    return this.findOne(id);
  }

  async complete(id: number) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
      relations: ['details'],
    });

    if (!quote) throw new NotFoundException('Cotización no encontrada.');

    const completedStateId = await this.resolveCompletedStateId();

    if (quote.statesid === completedStateId) throw new BadRequestException('La cotización ya fue completada.');

    if (quote.statesid === 8) throw new BadRequestException(
        'No se puede completar una cotización anulada.',
      );

    if (quote.statesid !== 3) throw new BadRequestException(
        'Solo cotizaciones aprobadas pueden convertirse en ventas.',
      );

    const details = quote.details ?? [];
    if (!details.length) throw new BadRequestException(
        'La cotización no tiene productos para generar la venta.',
      );

    for (const detail of details) {
      if (!detail.productid) throw new BadRequestException(
          'Todos los detalles deben estar asociados a un producto para convertir la cotización en venta.',
        );
    }

    const salePayload: CreateSaleDto = {
      subtotal: Number(quote.subtotal ?? 0),
      taxamount: Number(quote.tax ?? 0),
      discountamount: 0,
      totalamount: Number(quote.total ?? 0),
      saledate: new Date().toISOString(),
      customerid: quote.customerid,
      salecode: `COT-${quote.quotesid}-${Date.now()}`,
      notes: quote.observation ?? undefined,
      paymentmethod: 'Cash',
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
    };

    const sale = await this.salesService.create(salePayload);

    await this.quotesRepo.update(
      { quotesid: id },
      { statesid: completedStateId, updatedat: new Date() },
    );

    const refreshed = await this.findOne(id);
    return { quote: refreshed, sale };
  }
}
