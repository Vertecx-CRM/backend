import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsCategoriesService } from './products-categories.service';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';

@Controller('products-categories')
export class ProductsCategoriesController {
  constructor(private readonly productsCategoriesService: ProductsCategoriesService) {}

  @Post()
  create(@Body() createProductsCategoryDto: CreateProductsCategoryDto) {
    return this.productsCategoriesService.create(createProductsCategoryDto);
  }

  @Get()
  findAll() {
    return this.productsCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductsCategoryDto: UpdateProductsCategoryDto) {
    return this.productsCategoriesService.update(+id, updateProductsCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsCategoriesService.remove(+id);
  }
}
