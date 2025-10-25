import { Injectable } from '@nestjs/common';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';

@Injectable()
export class ProductsCategoriesService {
  private categories = [];

  create(createProductsCategoryDto: CreateProductsCategoryDto) {
    const categoryDto = new CreateProductsCategoryDto(createProductsCategoryDto);

    const errors = categoryDto.validate();

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Validation errors',
        errors,
      };
    }

    const existingUser = this.categories.find(
      (u) => u.name === categoryDto.name
    );

    if (existingUser) {
      return {
        success: false,
        message: 'The category name already exists.',
        errors: ['The name is already registered for another product category.'],
      };
    }

    const newCategory = {
      id: this.categories.length + 1,
      icon: categoryDto.icon,
      name: categoryDto.name,
      description: categoryDto.description,
      status: categoryDto.status,
      createdAt: new Date(),
    };

    this.categories.push(newCategory);

    return {
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    };
  }

  findAll() {
    return this.categories;
  }

  findOne(id: number) {
    const category = this.categories.find((cat) => cat.id === id);
    return category || { success: false, message: `Category with id not found ${id}` };
  }

  update(id: number, updateProductsCategoryDto: UpdateProductsCategoryDto) {
 
    const categoryDto = new UpdateProductsCategoryDto(updateProductsCategoryDto);
    const errors = categoryDto.validate();

    if (errors.length > 0) {
      return { success: false, message: 'Validation errors', errors };
    }

    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) {
      return { success: false, message: `Category with id not found ${id}` };
    }

    if (categoryDto.name) {
      const duplicateName = this.categories.find(
        (cat) => cat.name.toLowerCase() === categoryDto.name.toLowerCase() && cat.id !== id
      );

      if (duplicateName) {
        return {
          success: false,
          message: 'The category name already exists.',
          errors: ['There is already a category with the same name.'],
        };
      }
    }

    const filteredDto = Object.fromEntries(
      Object.entries(categoryDto).filter(([_, value]) => value !== undefined)
    );

    const updatedCategory = {
      ...this.categories[index],
      ...filteredDto,
      updatedAt: new Date(),
    };

    this.categories[index] = updatedCategory;

    return {
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }



  remove(id: number) {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) {
      return { message: `Category with id not found ${id}` };
    }

    const deleted = this.categories.splice(index, 1);
    return { message: 'Category successfully deleted', data: deleted[0] };
  }
}
