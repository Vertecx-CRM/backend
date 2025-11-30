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
    const rows = await this.dataSource.query(
      `
      SELECT
        EXISTS (SELECT 1 FROM public.purchase_products pp WHERE pp.productid = $1) AS "hasPurchases",
        EXISTS (SELECT 1 FROM public.ordersproducts op WHERE op.productid = $1) AS "hasOrdersProducts",
        EXISTS (SELECT 1 FROM public.ordersservicesproducts osp WHERE osp.productid = $1) AS "hasOrdersServicesProducts",
        EXISTS (SELECT 1 FROM public.salesdetail sd WHERE sd.productid = $1) AS "hasSales"
      `,
      [productid],
    );

    const r = rows?.[0] ?? {};
    const hasPurchases = !!r.hasPurchases;
    const hasOrdersProducts = !!r.hasOrdersProducts;
    const hasOrdersServicesProducts = !!r.hasOrdersServicesProducts;
    const hasSales = !!r.hasSales;

    return {
      hasPurchases,
      hasOrdersProducts,
      hasOrdersServicesProducts,
      hasSales,
      hasAny: hasPurchases || hasOrdersProducts || hasOrdersServicesProducts || hasSales,
    };
  }

  private buildReferenceReason(rel: {
    hasPurchases: boolean;
    hasOrdersProducts: boolean;
    hasOrdersServicesProducts: boolean;
    hasSales: boolean;
  }) {
    const parts: string[] = [];
    if (rel.hasPurchases) parts.push('compras');
    if (rel.hasOrdersProducts) parts.push('órdenes (productos)');
    if (rel.hasOrdersServicesProducts) parts.push('órdenes (servicios)');
    if (rel.hasSales) parts.push('ventas');

    if (parts.length === 0) return 'Está asociado a otros registros del sistema.';
    if (parts.length === 1) return `Está asociado a ${parts[0]}.`;
    return `Está asociado a ${parts.join(' y ')}.`;
  }

  async getDeletionInfo(id: number) {
    const product = await this.productsRepo.findOne({ where: { productid: id } });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    const rel = await this.isReferenced(id);

    if (rel.hasAny) {
      return {
        canDelete: false,
        reason: this.buildReferenceReason(rel),
        canDeactivate: !!product.isactive,
      };
    }

    return { canDelete: true, canDeactivate: false };
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

