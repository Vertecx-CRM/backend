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
    // Validación: productos obligatorios
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException(
        'Debe incluir al menos un producto en la compra.',
      );
    }

    // Validar proveedor
    const supplier = await this.suppliersRepo.findOne({
      where: { supplierid: dto.supplierid },
    });
    if (!supplier) {
      throw new NotFoundException(
        `Proveedor con ID ${dto.supplierid} no encontrado.`,
      );
    }

    // Validar estado
    const state = await this.statesRepo.findOne({
      where: { stateid: dto.stateid },
    });
    if (!state) {
      throw new NotFoundException(
        `Estado con ID ${dto.stateid} no encontrado.`,
      );
    }

    // Validación: fechas coherentes
    if (dto.updatedat && dto.createdat && dto.updatedat < dto.createdat) {
      throw new BadRequestException(
        'La fecha de actualización no puede ser anterior a la fecha de creación.',
      );
    }

    // Validación de duplicados solo para productid existentes
    const ids = dto.products.filter((p) => p.productid).map((p) => p.productid);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      throw new BadRequestException(
        'No se permiten productos duplicados con el mismo productid.',
      );
    }

    // Validación de duplicados para productos nuevos (por nombre)
    const newNames = dto.products
      .filter((p) => !p.productid && p.productname)
      .map((p) => p.productname.toLowerCase().trim());

    const uniqueNames = new Set(newNames);
    if (uniqueNames.size !== newNames.length) {
      throw new BadRequestException(
        'No se permiten productos nuevos con el mismo nombre.',
      );
    }

    // Transacción principal
    return await this.dataSource.transaction(async (manager) => {
      const purchaseProducts: PurchaseProduct[] = [];
      let totalAmount = 0;

      for (const item of dto.products) {
        let product = null;

        // Buscar producto existente si viene productid
        if (item.productid) {
          product = await manager.findOne(Products, {
            where: { productid: item.productid },
          });

          if (!product) {
            throw new BadRequestException(
              `El producto con ID ${item.productid} no existe.`,
            );
          }
        }

        // Si NO existe → Crear producto nuevo
        if (!product) {
          if (!item.productname || !item.productpriceofsupplier) {
            throw new BadRequestException(
              'Para crear un producto nuevo debes enviar productname y productpriceofsupplier',
            );
          }

          product = manager.create(Products, {
            productname: item.productname,
            productpriceofsupplier: item.productpriceofsupplier,
            productpriceofsale:
              item.saleprice ?? item.productpriceofsupplier * 1.3,
            productdescription: item.description ?? null,
            productstock: 0,
            isactive: true,
            categoryid: 1,
            createddate: new Date(),
          });

          product = await manager.save(Products, product);
        }

        // Validar cantidad
        if (item.quantity <= 0) {
          throw new BadRequestException(
            `La cantidad del producto ${product.productname} debe ser mayor que 0.`,
          );
        }

        // Validar unitprice
        if (item.unitprice <= 0) {
          throw new BadRequestException(
            `El precio unitario del producto ${product.productname} debe ser mayor que 0.`,
          );
        }

        // Validar saleprice coherente
        if (item.saleprice) {
          if (item.unitprice > item.saleprice) {
            throw new BadRequestException(
              `El precio unitario del producto ${product.productname} no puede ser mayor que su precio de venta.`,
            );
          }

          product.productpriceofsale = item.saleprice;
        }

        // Validar precio final no sea cero
        if (product.productpriceofsale === 0) {
          throw new BadRequestException(
            `El producto ${product.productname} tiene un precio de venta igual a cero. Actualiza su precio antes de continuar.`,
          );
        }

        // Actualizar stock
        product.productstock += item.quantity;

        if (product.productstock < 0) {
          throw new BadRequestException(
            `El stock del producto ${product.productname} no puede ser negativo.`,
          );
        }

        await manager.save(Products, product);

        // Subtotal y total
        const subtotal = item.quantity * item.unitprice;
        totalAmount += subtotal;

        // Crear entrada en purchase_products
        const payload: any = {
          productid: product.productid,
          quantity: item.quantity,
          unitprice: item.unitprice,
        };

        if (item.description) payload.description = item.description;

        const purchaseProduct = manager.create(PurchaseProduct, payload);
        purchaseProducts.push(purchaseProduct);
      }

      // Generar número de orden
      const year = new Date().getFullYear();
      const result = await manager.query(
        `SELECT nextval('purchase_order_seq')`,
      );
      const nextNumber = result[0].nextval;
      const numberoforder = `ORD-${year}-${String(nextNumber).padStart(3, '0')}`;

      // Crear compra
      const purchase = manager.create(Purchasesmanagement, {
        numberoforder,
        reference: dto.reference,
        observation: dto.observation,
        supplierid: dto.supplierid,
        stateid: dto.stateid,
        createdat: dto.createdat,
        updatedat: dto.updatedat,
        amount: totalAmount,
      });

      const savedPurchase = await manager.save(purchase);

      // Asociar productos comprados
      for (const p of purchaseProducts) {
        p.purchaseorderid = savedPurchase.purchaseorderid;
        await manager.save(PurchaseProduct, p);
      }

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
    return await this.purchasesRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.state', 'state')
      .leftJoinAndSelect('p.supplier', 'supplier')
      .leftJoinAndSelect('p.purchaseProducts', 'pp')
      .leftJoinAndSelect('pp.product', 'product')
      .orderBy('p.purchaseorderid', 'DESC')
      .cache('purchases_list', 60000) // Cache con key específica, 1 minuto
      .getMany();
  }

  async findAllPaginated(page: number = 1, limit: number = 20) {
    const [data, total] = await this.purchasesRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.state', 'state')
      .leftJoinAndSelect('p.supplier', 'supplier')
      .leftJoinAndSelect('p.purchaseProducts', 'pp')
      .leftJoinAndSelect('pp.product', 'product')
      .orderBy('p.purchaseorderid', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .cache(`purchases_page_${page}_${limit}`, 60000)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
