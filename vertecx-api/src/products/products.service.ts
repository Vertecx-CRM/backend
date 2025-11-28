import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Products } from './entities/products.entity';
import { Categories } from './entities/categories.entity';
import { Ordersproducts } from './entities/ordersproducts.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StatusQuery } from './products.controller';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,

    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,

    @InjectRepository(PurchaseProduct)
    private readonly purchaseProductsRepo: Repository<PurchaseProduct>,

    @InjectRepository(Ordersproducts)
    private readonly ordersProductsRepo: Repository<Ordersproducts>,
  ) {}

  private async ensureCategoryExists(categoryid: number) {
    const category = await this.categoriesRepo.findOne({ where: { categoryid } as any });
    if (!category) {
      throw new BadRequestException(`La categoría (${categoryid}) no existe en categories.`);
    }
    return category;
  }

  async create(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryid);

    const entity = this.productsRepo.create({
      productname: dto.productname,
      productdescription: dto.productdescription ?? null,
      categoryid: dto.categoryid,
      suppliercategory: dto.suppliercategory ?? null,
      productcode: dto.productcode ?? null,
      productpriceofsale: dto.productpriceofsale ?? null,
      productpriceofsupplier: dto.productpriceofsupplier,
      isactive: dto.isactive ?? true,
    });

    return await this.productsRepo.save(entity);
  }

  async findAll(status: StatusQuery = 'active') {
    const where =
      status === 'all'
        ? {}
        : { isactive: status === 'active' };

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
    const product = await this.productsRepo.findOne({ where: { productid: id } as any });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    if (dto.categoryid !== undefined) {
      await this.ensureCategoryExists(dto.categoryid);
      product.categoryid = dto.categoryid;
    }

    if (dto.productname !== undefined) product.productname = dto.productname;
    if (dto.productdescription !== undefined) product.productdescription = dto.productdescription ?? null;
    if (dto.suppliercategory !== undefined) product.suppliercategory = dto.suppliercategory ?? null;
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

  async remove(id: number) {
    const product = await this.productsRepo.findOne({ where: { productid: id } as any });
    if (!product) throw new NotFoundException(`Producto (${id}) no encontrado.`);

    const rel = await this.isReferenced(id);

    if (rel.hasAny) {
      if (!product.isactive) {
        throw new BadRequestException('El producto ya está inactivo.');
      }
      product.isactive = false;
      const saved = await this.productsRepo.save(product);
      return { deleted: true, mode: 'soft', product: saved };
    }

    await this.productsRepo.delete({ productid: id } as any);
    return { deleted: true, mode: 'hard', productid: id };
  }
}
