import { Module } from '@nestjs/common';
import { ProductsCategoriesService } from './products-categories.service';
import { ProductsCategoriesController } from './products-categories.controller';

@Module({
  controllers: [ProductsCategoriesController],
  providers: [ProductsCategoriesService],
})
export class ProductsCategoriesModule {}
