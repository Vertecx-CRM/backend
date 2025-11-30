import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial, Not, In } from 'typeorm';
import { Purchasesmanagement } from './entities/purchasesmanagement.entity';
import { CreatePurchasesmanagementDto } from './dto/create-purchasesmanagement.dto';
import { UpdatePurchasesmanagementDto } from './dto/update-purchasesmanagement.dto';
import { Products } from 'src/products/entities/products.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';
import { States } from 'src/shared/entities/states.entity';

@Injectable()
export class PurchasesmanagementService {
  constructor(
    @InjectRepository(Purchasesmanagement)
    private readonly purchasesRepo: Repository<Purchasesmanagement>,

    @InjectRepository(PurchaseProduct)
    private readonly purchaseProductsRepo: Repository<PurchaseProduct>,

    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    @InjectRepository(Suppliers)
    private readonly suppliersRepo: Repository<Suppliers>,

    @InjectRepository(States)
    private readonly statesRepo: Repository<States>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePurchasesmanagementDto) {
    //  Validación 1: Productos obligatorios
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException(
        'Debe incluir al menos un producto en la compra.',
      );
    }

    //  Validación 3: Validar proveedor
    const supplier = await this.suppliersRepo.findOne({
      where: { supplierid: dto.supplierid },
    });
    if (!supplier) {
      throw new NotFoundException(
        `Proveedor con ID ${dto.supplierid} no encontrado.`,
      );
    }

    // Validación 4: Validar estado
    const state = await this.statesRepo.findOne({
      where: { stateid: dto.stateid },
    });
    if (!state) {
      throw new NotFoundException(
        `Estado con ID ${dto.stateid} no encontrado.`,
      );
    }

    // Validación 5: Duplicados en los productos
    const uniqueProducts = new Set(dto.products.map((p) => p.productid));
    if (uniqueProducts.size !== dto.products.length) {
      throw new BadRequestException(
        'No se permiten productos duplicados en la compra.',
      );
    }

    // Validación 6: Fechas coherentes
    if (dto.updatedat && dto.createdat && dto.updatedat < dto.createdat) {
      throw new BadRequestException(
        'La fecha de actualización no puede ser anterior a la fecha de creación.',
      );
    }

    // Transacción principal
    return await this.dataSource.transaction(async (manager) => {
      const purchaseProducts: PurchaseProduct[] = [];
      let totalAmount = 0;

      for (const item of dto.products) {
        let product = null;

        // Si viene productid → buscar
        if (item.productid) {
          product = await manager.findOne(Products, {
            where: { productid: item.productid },
          });
        }

        // Si NO existe → CREARLO
        if (!product) {
          if (!item.productname || !item.productpriceofsupplier) {
            throw new BadRequestException(
              'Para crear un producto nuevo debes enviar productname y productpriceofsupplier',
            );
          }

          product = manager.create(Products, {
            productname: item.productname,
            productpriceofsupplier: item.productpriceofsupplier,
            productpriceofsale: item.productpriceofsupplier * 1.3,
            productdescription: item.description,
            productstock: 0,
            isactive: true,
            categoryid: 1,
            createddate: new Date().toISOString(),
          });

          product = await manager.save(Products, product);
        }

        // Validar cantidad y precio
        if (item.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad del producto ${product.productname} debe ser mayor que 0.`,
          );
        }
        if (item.unitprice <= 0) {
          throw new BadRequestException(
            `El precio unitario del producto ${product.productname} debe ser mayor que 0.`,
          );
        }

        const subtotal = item.quantity * item.unitprice;
        totalAmount += subtotal;

        const payload: any = {
          productid: product.productid,
          quantity: item.quantity,
          unitprice: item.unitprice,
        };

        if (item.description) {
          payload.description = item.description;
        }

        const purchaseProduct = manager.create(PurchaseProduct, payload);

        purchaseProducts.push(purchaseProduct);
      }

      const year = new Date().getFullYear();

      const result = await manager.query(
        "SELECT nextval('purchase_order_seq')",
      );

      const nextNumber = result[0].nextval;

      const numberoforder = `ORD-${year}-${String(nextNumber).padStart(3, '0')}`;

      // Crear la compra
      const purchase = manager.create(Purchasesmanagement, {
        numberoforder,
        reference: dto.reference,
        supplierid: dto.supplierid,
        stateid: dto.stateid,
        createdat: dto.createdat,
        updatedat: dto.updatedat,
        amount: totalAmount,
      } as DeepPartial<Purchasesmanagement>);

      const savedPurchase = await manager.save(purchase);

      // Asociar los productos
      for (const p of purchaseProducts) {
        p.purchaseorderid = savedPurchase.purchaseorderid;
        await manager.save(PurchaseProduct, p);
      }

      // Retornar la compra con sus relaciones
      return await manager.findOne(Purchasesmanagement, {
        where: { purchaseorderid: savedPurchase.purchaseorderid },
        relations: [
          'supplier',
          'state',
          'purchaseProducts',
          'purchaseProducts.product',
        ],
      });
    });
  }

  async findAll() {
    return await this.purchasesRepo.find({
      where: {
        stateid: Not(In([1, 2, 4, 5, 6, 7])),
      },
      relations: [
        'state',
        'supplier',
        'purchaseProducts',
        'purchaseProducts.product',
      ],
    });
  }

  async findOne(id: number) {
    const purchase = await this.purchasesRepo.findOne({
      where: { purchaseorderid: id },
      relations: [
        'state',
        'supplier',
        'purchaseProducts',
        'purchaseProducts.product',
      ],
    });
    if (!purchase)
      throw new NotFoundException(`Compra con ID ${id} no encontrada.`);
    return purchase;
  }

  async update(id: number, dto: UpdatePurchasesmanagementDto) {
    const purchase = await this.findOne(id);

    // Validar coherencia del estado
    if (dto.stateid) {
      const state = await this.statesRepo.findOne({
        where: { stateid: dto.stateid },
      });
      if (!state) {
        throw new NotFoundException(
          `Estado con ID ${dto.stateid} no encontrado.`,
        );
      }
    }

    Object.assign(purchase, dto);
    return await this.purchasesRepo.save(purchase);
  }

  async cancel(id: number) {
    const purchase = await this.purchasesRepo.findOne({
      where: { purchaseorderid: id },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (purchase.stateid === 8) {
      throw new BadRequestException('La compra ya está anulada.');
    }

    if (purchase.stateid !== 3) {
      throw new BadRequestException('Solo se pueden anular compras aprobadas.');
    }

    purchase.stateid = 8;
    purchase.updatedat = new Date();

    const saved = await this.purchasesRepo.save(purchase);
    return saved;
  }

  async remove(id: number) {
    const purchase = await this.findOne(id);
    await this.purchasesRepo.remove(purchase);
    return { message: `Compra ${id} eliminada correctamente.` };
  }
}
