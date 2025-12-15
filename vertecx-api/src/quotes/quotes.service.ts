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
import { Products } from 'src/products/entities/products.entity';

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
    // Buscar la solicitud de servicio
    const serviceRequest = await this.serviceRequestRepo.findOne({
      where: { serviceRequestId: dto.serviceRequestId },
      relations: {
        customer: true,
        techniciansMap: { technician: true },
      },
    });

    if (!serviceRequest) {
      throw new BadRequestException(
        `ServiceRequest ${dto.serviceRequestId} no existe`,
      );
    }

    // Resolver cliente automáticamente
    const customerId = serviceRequest.clientId;

    // Resolver técnico automáticamente
    const technicianMap = serviceRequest.techniciansMap?.[0];
    if (!technicianMap) {
      throw new BadRequestException(
        `La solicitud ${dto.serviceRequestId} no tiene técnico asignado`,
      );
    }

    const technicianId = technicianMap.technicianId;

    const detailsCalculated = await Promise.all(
      dto.details.map(async (d) => {
        const quantity = Number(d.quantity);
        if (quantity <= 0) {
          throw new BadRequestException('Cantidad inválida');
        }

        let unitprice: number;

        // PRODUCTO EXISTENTE → PRECIO REAL DE VENTA
        if (d.productid) {
          const product = await this.productsRepo.findOne({
            where: { productid: d.productid },
          });

          if (!product) {
            throw new BadRequestException(`Producto ${d.productid} no existe`);
          }

          unitprice = Number(product.productpriceofsale);
        }
        //  PRODUCTO MANUAL
        else {
          if (d.unitprice == null || d.unitprice < 0) {
            throw new BadRequestException(
              'Precio inválido para producto manual',
            );
          }
          unitprice = Number(d.unitprice);
        }

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

    // =====================================================
    // Crear cotización
    // =====================================================

    const quote = this.quotesRepo.create({
      serviceRequestId: dto.serviceRequestId,
      ordersservicesid: dto.ordersservicesid ?? null,
      statesid: dto.statesid,
      customerid: customerId,
      technicianid: technicianId,
      observation: dto.observation ?? null,
      servicetype: dto.servicetype ?? serviceRequest.serviceType,

      subtotal: subtotalGeneral,
      tax,
      total,

      details: detailsCalculated.map((d) =>
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

  /* =====================================================
     CANCELAR COTIZACIÓN
     ===================================================== */

  async cancel(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Ya anulada
    if (quote.statesid === 8) {
      throw new BadRequestException('La cotización ya está anulada.');
    }

    // Solo se permite anular si está aprobada
    if (quote.statesid !== 3) {
      throw new BadRequestException(
        'Solo se pueden anular cotizaciones aprobadas.',
      );
    }

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

  /* =====================================================
   APROBAR COTIZACIÓN
   ===================================================== */
  async approve(id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });

    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Ya aprobada
    if (quote.statesid === 3) {
      throw new BadRequestException('La cotización ya está aprobada.');
    }

    // No se puede aprobar si está anulada
    if (quote.statesid === 8) {
      throw new BadRequestException(
        'No se puede aprobar una cotización anulada.',
      );
    }

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

  /* =====================================================
   CANCELAR COTIZACIÓN
   ===================================================== */

   async cancelForClient (id: number, observation?: string) {
    const quote = await this.quotesRepo.findOne({
      where: { quotesid: id },
    });
    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    // Ya esta cancelada
      if (quote.statesid === 4) {
      throw new BadRequestException('La cotización ya está cancelada.');
    }

    // No se puede cancelar si esta aprovada
    if (quote.statesid === 3) {
      throw new BadRequestException(
        'No se puede cancelar una cotización aprovada.',
      );
    }

    // No se puede cancelar si esta anulada
    if (quote.statesid === 8) {
      throw new BadRequestException(
        'No se puede cancelar una cotización anulada.',
      )
    }

    
    const updateData: Partial<Quotes> = {
      statesid: 4, // APROBADA
      updatedat: new Date(),
    };


    await this.quotesRepo.update({quotesid: id}, updateData);

    return this.findOne(id)

  }
}
