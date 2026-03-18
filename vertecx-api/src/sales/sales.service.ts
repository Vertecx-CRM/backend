import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sales } from './entities/sales.entity';
import { Salesdetail } from './entities/salesdetail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Products } from 'src/products/entities/products.entity';
import { Customers } from 'src/customers/entities/customers.entity';
import { resolveUserIdFromAuth } from 'src/shared/utils/resolve-user-id';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sales)
    private readonly salesRepo: Repository<Sales>,

    @InjectRepository(Customers)
    private readonly customersRepo: Repository<Customers>,

    private readonly dataSource: DataSource,
  ) { }

  private withDireccionFromServiceRequest<T extends Sales | null>(sale: T) {
    if (!sale) return sale;
    const detailList = Array.isArray((sale as any).salesdetail) ? (sale as any).salesdetail : [];
    const withRequest = detailList.find((d: any) => {
      const dir = String(d?.serviceRequest?.direccion ?? "").trim();
      return dir.length > 0;
    });
    const direccion = String(withRequest?.serviceRequest?.direccion ?? "").trim();
    return {
      ...(sale as any),
      direccion: direccion || undefined,
    };
  }

  async create(dto: CreateSaleDto) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Validar productos, stock y calcular subtotal + descuentos por línea
      let subtotal = 0;
      let discountByLines = 0;

      for (const d of dto.details) {
        const product = await manager.findOne(Products, {
          where: { productid: d.productid },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${d.productid} no encontrado.`,
          );
        }

        const currentStock = product.productstock ?? 0;
        if (currentStock < d.quantity) throw new BadRequestException(
            `Stock insuficiente para el producto ${product.productname}. Disponible: ${currentStock}, solicitado: ${d.quantity}.`,
          );

        product.productstock = currentStock - d.quantity;
        await manager.save(Products, product);

        const lineTotal = d.quantity * d.unitprice;
        const lineDiscount =
          d.discountpercent && d.discountpercent > 0
            ? (lineTotal * d.discountpercent) / 100
            : 0;

        subtotal += lineTotal;
        discountByLines += lineDiscount;
      }

      // 2. Cálculo de totales como en la tarjeta "Total"
      const taxPercent = dto.taxpercent ?? 19; // IVA 19% por defecto
      const taxamount = Number(
        ((subtotal - discountByLines) * taxPercent) / 100,
      );
      const globalDiscount = dto.discountamount ?? 0;
      const shippingAmount = dto.shippingamount ?? 0;
      const totalDiscount = discountByLines + globalDiscount;
      const totalamount = subtotal - totalDiscount + taxamount + shippingAmount;

      // 3. Crear venta
      const sale = manager.create(Sales, {
        salecode: dto.salecode, // si lo generas en el front o en otro servicio
        saledate: dto.saledate,
        customerid: dto.customerid,
        salestatus: dto.salestatus ?? 'Pending',
        paymentmethod: dto.paymentmethod ?? 'Cash',
        notes: dto.notes ?? null,
        createdby: dto.createdby ?? null,
        createddate: new Date().toISOString(),

        subtotal,
        taxamount,
        discountamount: totalDiscount,
        totalamount,
      });

      const savedSale = await manager.save(Sales, sale);

      // 4. Crear detalles
      for (const d of dto.details) {
        const lineTotal = d.quantity * d.unitprice;
        const lineDiscount =
          d.discountpercent && d.discountpercent > 0
            ? (lineTotal * d.discountpercent) / 100
            : 0;

        const detail = manager.create(Salesdetail, {
          saleid: savedSale.saleid,
          productid: d.productid,
          quantity: d.quantity,
          unitprice: d.unitprice,
          linetotal: lineTotal - lineDiscount,
          discountpercent: d.discountpercent ?? 0,
          discountamount: lineDiscount,
          notes: d.notes ?? null,
          servicerequestid: d.servicerequestid ?? null,
        });

        await manager.save(Salesdetail, detail);
      }

      // 5. Devolver venta con relaciones para el detalle
      const fullSale = await manager.findOne(Sales, {
        where: { saleid: savedSale.saleid },
        relations: [
          'customer',
          'salesdetail',
          'salesdetail.products',
          'salesdetail.serviceRequest',
        ],
      });
      return this.withDireccionFromServiceRequest(fullSale);
    });
  }

  async createFromAuth(user: any, dto: Omit<CreateSaleDto, 'customerid'>) {
    const userId = resolveUserIdFromAuth(user);
    const customer = await this.customersRepo.findOne({
      where: { userid: userId },
    });

    if (!customer) {
      throw new BadRequestException(
        'El usuario autenticado no tiene un cliente asociado.',
      );
    }

    return this.create({
      ...dto,
      customerid: Number(customer.customerid),
    });
  }

  //  Obtener todas las ventas (para el DataTable)
  async findAll() {
    const list = await this.salesRepo.find({
      relations: [
        'customer',
        'customer.users',
        'salesdetail',
        'salesdetail.products',
        'salesdetail.serviceRequest',
      ],
      order: { saleid: 'DESC' },
    });
    return list.map((sale) => this.withDireccionFromServiceRequest(sale));
  }

  //  Obtener venta por ID (para ViewSale)
  async findOne(id: number) {
    const sale = await this.salesRepo.findOne({
      where: { saleid: id },
      relations: [
        'customer',
        'customer.users',
        'salesdetail',
        'salesdetail.products',
        'salesdetail.serviceRequest',
      ],
    });

    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    return this.withDireccionFromServiceRequest(sale);
  }

  async update(id: number, dto: UpdateSaleDto) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    Object.assign(sale, dto);
    return await this.salesRepo.save(sale);
  }

  //Revierte stock + valida estado
  async cancel(id: number, observation?: string) {
    const sale = await this.salesRepo.findOne({
      where: { saleid: id },
      relations: ['salesdetail'],
    });

    if (!sale) throw new NotFoundException('Venta no encontrada.');

    if (sale.salestatus === 'Cancelled') {
      throw new BadRequestException('La venta ya está anulada.');
    }

    if (sale.salestatus !== 'Pending' && sale.salestatus !== 'Completed') {
      throw new BadRequestException(
        'Solo se pueden anular ventas en estado Pending o Completed.',
      );
    }

    // ✅ No permitir anular si tiene pago registrado
    if (sale.estadoPago === 'Pagada') {
      throw new BadRequestException(
        'No se puede anular una venta que ya fue pagada.',
      );
    }

    if (sale.estadoPago === 'Abonada') {
      throw new BadRequestException(
        'No se puede anular una venta con abono registrado. Revise el pago antes de anular.',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // Reintegrar stock
      for (const detail of sale.salesdetail) {
        await manager.increment(
          Products,
          { productid: detail.productid },
          'productstock',
          detail.quantity,
        );
      }

      // Actualizar estado
      await manager.update(
        Sales,
        { saleid: id },
        {
          salestatus: 'Cancelled',
          notes: observation ?? sale.notes,
        },
      );

      return manager.findOne(Sales, { where: { saleid: id } });
    });
  }

  //Si estadoPago = 'Pagada' → salestatus = 'Completed' automáticamente
  async updateEstadoPago(
    id: number,
    estadoPago: 'Abonada' | 'Pagada',
  ) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });

    if (!sale) {
      throw new NotFoundException(`Venta ${id} no encontrada.`);
    }

    sale.estadoPago = estadoPago;

    // Cambio automático de estado al marcar como pagada
    if (estadoPago === 'Pagada') {
      sale.salestatus = 'Completed';
    }

    return await this.salesRepo.save(sale);
  }

  //Solo si está cancelada
  async remove(id: number) {
    const sale = await this.salesRepo.findOne({
      where: { saleid: id },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada.');
    }

    if (sale.salestatus !== 'Cancelled') {
      throw new BadRequestException(
        'Solo se pueden eliminar ventas que ya estén anuladas.',
      );
    }

    await this.salesRepo.remove(sale);

    return { message: `Venta ${id} eliminada correctamente.` };
  }
}

