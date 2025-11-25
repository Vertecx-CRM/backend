import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { ProductsCategoriesController } from 'src/products-categories/products-categories.controller';
import { Suppliers } from 'src/suppliers/entities/suppliers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Products,
      ProductsCategoriesController,
      Suppliers,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
