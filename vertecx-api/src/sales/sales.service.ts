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

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sales)
    private readonly salesRepo: Repository<Sales>,

    @InjectRepository(Salesdetail)
    private readonly detailsRepo: Repository<Salesdetail>,

    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSaleDto) {
    if (!dto.details || dto.details.length === 0) {
      throw new BadRequestException(
        'Debe incluir al menos un producto/servicio.',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Validar productos y calcular subtotal + descuentos por línea
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

      const totalDiscount = discountByLines + globalDiscount;

      const totalamount = subtotal - totalDiscount + taxamount;

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
        });

        await manager.save(Salesdetail, detail);
      }

      // 5. Devolver venta con relaciones para el detalle
      return await manager.findOne(Sales, {
        where: { saleid: savedSale.saleid },
        relations: ['customer', 'salesdetail', 'salesdetail.products'],
      });
    });
  }

  //  Obtener todas las ventas (para el DataTable)
  async findAll() {
    return await this.salesRepo.find({
      relations: ['customer', 'salesdetail', 'salesdetail.products'],
      order: { saleid: 'DESC' },
    });
  }

  //  Obtener venta por ID (para ViewSale)
  async findOne(id: number) {
    const sale = await this.salesRepo.findOne({
      where: { saleid: id },
      relations: ['customer', 'salesdetail', 'salesdetail.products'],
    });

    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);
    return sale;
  }
  //  Actualizar venta
  async update(id: number, dto: UpdateSaleDto) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    Object.assign(sale, dto);
    return await this.salesRepo.save(sale);
  }

  //  Eliminar venta (con detalles)
  async remove(id: number) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    await this.detailsRepo.delete({ saleid: id });
    return await this.salesRepo.delete(id);
  }
}
