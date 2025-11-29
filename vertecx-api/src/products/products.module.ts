import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { Products } from './entities/products.entity';
import { Ordersproducts } from './entities/ordersproducts.entity';
import { PurchaseProduct } from 'src/shared/entities/purchase-product.entity';
import { ProductCategory } from 'src/products-categories/entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Products, ProductCategory, Ordersproducts, PurchaseProduct])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
