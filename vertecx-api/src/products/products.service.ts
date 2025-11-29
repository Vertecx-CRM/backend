import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Products } from './entities/products.entity';
import { Ordersproducts } from './entities/ordersproducts.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { ProductCategory } from 'src/products-categories/entities/product-category.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepo: Repository<ProductCategory>,

    @InjectRepository(PurchaseProduct)
    private readonly purchaseProductsRepo: Repository<PurchaseProduct>,

    @InjectRepository(Ordersproducts)
    private readonly ordersProductsRepo: Repository<Ordersproducts>,

    private readonly dataSource: DataSource,
  ) {}

  private async ensureCategoryExists(categoryid: number) {
    const category = await this.productCategoriesRepo.findOne({
      where: { id: categoryid } as any,
    });

    if (!category) {
      throw new BadRequestException(`La categoría (${categoryid}) no existe en categories.`);
    }
    return category;
  }

  async create(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryid);

    const entity = this.productsRepo.create({
      productname: dto.productname.trim(),
      productdescription: dto.productdescription ?? null,
      categoryid: dto.categoryid,
      suppliercategory: dto.suppliercategory.trim(),
      image: dto.image.trim(),
      productcode: dto.productcode ?? null,
      productpriceofsale: dto.productpriceofsale ?? null,
      productpriceofsupplier: dto.productpriceofsupplier,
      isactive: dto.isactive ?? true,
    });

    return await this.productsRepo.save(entity);
  }

  async findAll(status: 'active' | 'inactive' | 'all' = 'active') {
    const where = status === 'all' ? {} : { isactive: status === 'active' };

    return await this.productsRepo.find({
      where: where as any,
      relations: { category: true },
      order: { productid: 'DESC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepo.findOne({
      where: { productid: id },
      relations: { category: true },
    });

    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productsRepo.findOne({ where: { productid: id } });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    if (dto.categoryid !== undefined) {
      await this.ensureCategoryExists(dto.categoryid);
      product.categoryid = dto.categoryid;
    }

    if (dto.productname !== undefined) {
      const v = dto.productname.trim();
      if (!v) throw new BadRequestException('El nombre del producto es obligatorio.');
      product.productname = v;
    }

    if (dto.productdescription !== undefined) product.productdescription = dto.productdescription ?? null;

    if (dto.suppliercategory !== undefined) {
      const v = dto.suppliercategory?.trim();
      if (!v) throw new BadRequestException('La categoría del proveedor es obligatoria.');
      product.suppliercategory = v;
    }

    if (dto.image !== undefined) {
      const v = dto.image?.trim();
      if (!v) {
        throw new BadRequestException(
          'La imagen es obligatoria. No puedes eliminarla; si deseas cambiarla, envía una nueva URL.',
        );
      }
      product.image = v;
    }

    if (dto.productcode !== undefined) product.productcode = dto.productcode ?? null;
    if (dto.productpriceofsale !== undefined) product.productpriceofsale = dto.productpriceofsale ?? null;
    if (dto.productpriceofsupplier !== undefined) product.productpriceofsupplier = dto.productpriceofsupplier;
    if (dto.isactive !== undefined) product.isactive = dto.isactive;

    return await this.productsRepo.save(product);
  }

  private async isReferenced(productid: number) {
    const [purchasesCount, ordersCount] = await Promise.all([
      this.purchaseProductsRepo.count({ where: { productid } as any }),
      this.ordersProductsRepo.count({ where: { productid } as any }),
    ]);

    return {
      purchasesCount,
      ordersCount,
      hasAny: purchasesCount > 0 || ordersCount > 0,
    };
  }

  private buildReferenceReason(rel: { purchasesCount: number; ordersCount: number }) {
    const parts: string[] = [];
    if (rel.purchasesCount > 0) parts.push(`compras (${rel.purchasesCount})`);
    if (rel.ordersCount > 0) parts.push(`órdenes (${rel.ordersCount})`);
    if (parts.length === 0) return 'Está asociado a otros registros del sistema.';
    return `Está asociado a ${parts.join(' y ')}.`;
  }

  private fkReason(e: any) {
    const code = String(e?.code ?? '');
    if (code === '23503' || code === '1451') {
      const detail = String(e?.detail ?? e?.message ?? '');
      const tableMatch = detail.match(/table "([^"]+)"/i);
      const table = tableMatch?.[1];
      return table
        ? `Está asociado a registros en "${table}".`
        : 'Está asociado a compras/órdenes/ventas u otros registros.';
    }
    return 'No se pudo verificar la eliminación por una restricción del sistema.';
  }

  async getDeletionInfo(id: number) {
    const product = await this.productsRepo.findOne({ where: { productid: id } });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    const rel = await this.isReferenced(id);
    if (rel.hasAny) {
      return { canDelete: false, reason: this.buildReferenceReason(rel) };
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.delete(Products, { productid: id } as any);
      await qr.rollbackTransaction();
      return { canDelete: true };
    } catch (e: any) {
      await qr.rollbackTransaction();
      return { canDelete: false, reason: this.fkReason(e) };
    } finally {
      await qr.release();
    }
  }

  async remove(id: number) {
    const product = await this.productsRepo.findOne({ where: { productid: id } });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    const rel = await this.isReferenced(id);

    if (rel.hasAny) {
      if (!product.isactive) throw new BadRequestException('El producto ya está inactivo.');
      product.isactive = false;
      return await this.productsRepo.save(product);
    }

    try {
      await this.productsRepo.delete({ productid: id } as any);
      return { deleted: true, mode: 'hard', productid: id };
    } catch (e: any) {
      if (e?.code === '23503') {
        if (!product.isactive) throw new BadRequestException('El producto ya está inactivo.');
        product.isactive = false;
        return await this.productsRepo.save(product);
      }
      throw e;
    }
  }
}
