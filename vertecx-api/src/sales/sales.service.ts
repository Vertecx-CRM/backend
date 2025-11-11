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

  // ✅ Crear venta (con detalles)
  async create(dto: CreateSaleDto) {
    if (!dto.details || dto.details.length === 0) {
      throw new BadRequestException('Debe incluir al menos un producto.');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Validar productos y calcular totales
      let subtotal = 0;

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
        subtotal += lineTotal;
      }

      // Crear venta
      const sale = manager.create(Sales, {
        subtotal: subtotal,
        taxamount: dto.taxamount ?? 0,
        discountamount: dto.discountamount ?? 0,
        totalamount:
          subtotal + (dto.taxamount ?? 0) - (dto.discountamount ?? 0),
        saledate: dto.saledate,
        createddate: new Date().toISOString(),
        customerid: dto.customerid,
        salecode: dto.salecode,
        createdby: dto.createdby,
        notes: dto.notes,
        paymentmethod: dto.paymentmethod,
        salestatus: dto.salestatus ?? 'Completada',
      });

      const savedSale = await manager.save(Sales, sale);

      // Crear detalles
      for (const d of dto.details) {
        const lineTotal = d.quantity * d.unitprice;
        const discountAmount =
          d.discountpercent && d.discountpercent > 0
            ? (lineTotal * d.discountpercent) / 100
            : 0;

        const detail = manager.create(Salesdetail, {
          saleid: savedSale.saleid,
          productid: d.productid,
          quantity: d.quantity,
          unitprice: d.unitprice,
          linetotal: lineTotal - discountAmount,
          discountpercent: d.discountpercent ?? 0,
          discountamount: discountAmount,
          notes: d.notes,
        });

        await manager.save(Salesdetail, detail);
      }

      return await manager.findOne(Sales, {
        where: { saleid: savedSale.saleid },
        relations: ['salesdetail', 'salesdetail.products'],
      });
    });
  }

  // ✅ Obtener todas las ventas
  async findAll() {
    return await this.salesRepo.find({
      relations: ['salesdetail', 'salesdetail.products'],
      order: { saleid: 'DESC' },
    });
  }

  // ✅ Obtener venta por ID
  async findOne(id: number) {
    const sale = await this.salesRepo.findOne({
      where: { saleid: id },
      relations: ['salesdetail', 'salesdetail.products'],
    });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);
    return sale;
  }

  // ✅ Actualizar venta
  async update(id: number, dto: UpdateSaleDto) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    Object.assign(sale, dto);
    return await this.salesRepo.save(sale);
  }

  // ✅ Eliminar venta (con detalles)
  async remove(id: number) {
    const sale = await this.salesRepo.findOne({ where: { saleid: id } });
    if (!sale) throw new NotFoundException(`Venta ${id} no encontrada.`);

    await this.detailsRepo.delete({ saleid: id });
    return await this.salesRepo.delete(id);
  }
}
