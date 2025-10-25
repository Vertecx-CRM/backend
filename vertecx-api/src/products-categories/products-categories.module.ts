import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsCategoriesService } from './products-categories.service';
import { ProductsCategoriesController } from './products-categories.controller';
import { ProductCategory } from './entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory])],
  controllers: [ProductsCategoriesController],
  providers: [ProductsCategoriesService],
})
export class ProductsCategoriesModule {}
