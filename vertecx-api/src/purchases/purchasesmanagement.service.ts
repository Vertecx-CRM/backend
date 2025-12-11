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
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException(
        'Debe incluir al menos un producto en la compra.',
      );
    }

    // Cargar proveedor y estado EN PARALELO (más rápido)
    const [supplier, state] = await Promise.all([
      this.suppliersRepo.findOne({ where: { supplierid: dto.supplierid } }),
      this.statesRepo.findOne({ where: { stateid: dto.stateid } }),
    ]);

    if (!supplier)
      throw new NotFoundException(
        `Proveedor con ID ${dto.supplierid} no encontrado.`,
      );
    if (!state)
      throw new NotFoundException(
        `Estado con ID ${dto.stateid} no encontrado.`,
      );

    // Validación: fechas coherentes
    if (dto.updatedat && dto.createdat && dto.updatedat < dto.createdat) {
      throw new BadRequestException(
        'La fecha de actualización no puede ser anterior a la fecha de creación.',
      );
    }

    // --- VALIDACIONES DE DUPLICADOS ---
    const ids = dto.products.filter((p) => p.productid).map((p) => p.productid);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        'No se permiten productos duplicados con el mismo productid.',
      );
    }

    const newNames = dto.products
      .filter((p) => !p.productid && p.productname)
      .map((p) => p.productname.toLowerCase().trim());

    if (new Set(newNames).size !== newNames.length) {
      throw new BadRequestException(
        'No se permiten productos nuevos con el mismo nombre.',
      );
    }

    //  TRANSACCIÓN OPTIMIZADA
    return await this.dataSource.transaction(async (manager) => {
      const purchaseProducts: PurchaseProduct[] = [];

      const existingIds = ids.length > 0 ? ids : [-1];

      // Cargar TODOS los productos existentes en UNA sola consulta
      const existingProducts = await manager.find(Products, {
        where: { productid: In(existingIds) },
      });

      // Mapa en memoria → acceso O(1)
      const productMap = new Map(existingProducts.map((p) => [p.productid, p]));

      let totalAmount = 0;

      //  BATCH creada de nuevos productos
      const newProductsToCreate: Products[] = [];

      for (const item of dto.products) {
        let product = null;

        if (item.productid) {
          product = productMap.get(item.productid);
          if (!product) {
            throw new BadRequestException(
              `El producto con ID ${item.productid} no existe.`,
            );
          }
        }

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

          newProductsToCreate.push(product);
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
        if (item.saleprice && item.unitprice > item.saleprice) {
          throw new BadRequestException(
            `El precio unitario del producto ${product.productname} no puede ser mayor que su precio de venta.`,
          );
        }

        if (item.saleprice) {
          product.productpriceofsale = item.saleprice;
        }

        if (product.productpriceofsale === 0) {
          throw new BadRequestException(
            `El producto ${product.productname} tiene un precio de venta igual a cero.`,
          );
        }

        // Stock sumado internamente, sin guardar aún
        product.productstock += item.quantity;

        totalAmount += item.quantity * item.unitprice;

        const payload: any = {
          productid: undefined, // se rellena luego
          quantity: item.quantity,
          unitprice: item.unitprice,
          description: item.description ?? null,
        };

        const purchaseProduct = manager.create(PurchaseProduct, payload);
        purchaseProducts.push(purchaseProduct);
      }

      // INSERTAR TODOS LOS PRODUCTOS NUEVOS EN BATCH
      if (newProductsToCreate.length > 0) {
        const savedNew = await manager.save(Products, newProductsToCreate);
        for (const p of savedNew) {
          productMap.set(p.productid, p);
        }
      }

      // GUARDAR ACTUALIZACIONES DE STOCK EN BATCH
      await manager.save(Products, Array.from(productMap.values()));

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

      // Asignar purchaseorderid a todos los purchase_products
      for (let i = 0; i < purchaseProducts.length; i++) {
        const pp = purchaseProducts[i];
        const dtoProduct = dto.products[i];
        const prodId =
          dtoProduct.productid ||
          [...productMap.values()].find(
            (p) => p.productname === dtoProduct.productname,
          )?.productid;
        pp.purchaseorderid = savedPurchase.purchaseorderid;
        pp.productid = prodId ?? [...productMap.values()][0].productid;
      }

      // BATCH insert de purchase_products
      await manager.save(PurchaseProduct, purchaseProducts);

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
      .where('p.stateid IN (:...states)', { states: [3, 8] })
      .orderBy('p.purchaseorderid', 'DESC')
      .cache('purchases_list_filtered', 60000)
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

  async cancel(id: number, observation?: string) {
    const purchase = await this.purchasesRepo.findOneBy({
      purchaseorderid: id,
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

    // Armar payload de actualización (solo columnas necesarias)
    const updateData: Partial<Purchasesmanagement> = {
      stateid: 8,
      updatedat: new Date(),
    };

    if (observation) {
      updateData.observation = observation; // opcional
    }

    await this.purchasesRepo.update({ purchaseorderid: id }, updateData);

    // Retornar compra actualizada (rápido, sin relaciones)
    return await this.purchasesRepo.findOneBy({ purchaseorderid: id });
  }

  async remove(id: number) {
    const purchase = await this.findOne(id);
    await this.purchasesRepo.remove(purchase);
    return { message: `Compra ${id} eliminada correctamente.` };
  }
}
