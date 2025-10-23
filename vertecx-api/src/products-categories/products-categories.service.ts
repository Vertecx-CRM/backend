import { Injectable } from '@nestjs/common';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';

@Injectable()
export class ProductsCategoriesService {
  create(createProductsCategoryDto: CreateProductsCategoryDto) {
    return 'This action adds a new productsCategory';
  }

  findAll() {
    return `This action returns all productsCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productsCategory`;
  }

  update(id: number, updateProductsCategoryDto: UpdateProductsCategoryDto) {
    return `This action updates a #${id} productsCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} productsCategory`;
  }
}
