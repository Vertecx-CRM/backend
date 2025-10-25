import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductsCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  async create(dto: CreateProductsCategoryDto) {
    const categoryDto = new CreateProductsCategoryDto(dto);

    const errors = categoryDto.validate();
    if (errors.length > 0) {
      throw new BadRequestException({ success: false, message: 'Validation errors', errors });
    }

    const existing = await this.categoryRepo.findOne({ where: { name: categoryDto.name } });
    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'The category name already exists.',
        errors: ['There is already a category with the same name.'],
      });
    }

    const newCategory = this.categoryRepo.create({
      name: categoryDto.name,
      description: categoryDto.description,
      status: categoryDto.status,
      icon: categoryDto.icon,
    });

    const saved = await this.categoryRepo.save(newCategory);
    return { success: true, message: 'Category created successfully', data: saved };
  }

  findAll() {
    return this.categoryRepo.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException({ success: false, message: `Category with id not found ${id}` });
    }
    return category;
  }

  async update(id: number, dto: UpdateProductsCategoryDto) {
    const categoryDto = new UpdateProductsCategoryDto(dto);
    const errors = categoryDto.validate();
    if (errors.length > 0) {
      throw new BadRequestException({ success: false, message: 'Validation errors', errors });
    }

    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException({ success: false, message: `Category with id not found ${id}` });
    }

    Object.assign(category, dto, { updatedAt: new Date() });
    const updated = await this.categoryRepo.save(category);

    return { success: true, message: 'Category updated successfully', data: updated };
  }

  async remove(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new BadRequestException({ success: false, message: `Category with id not found ${id}` });
    }
    await this.categoryRepo.remove(category);
    return { success: true, message: 'Category successfully deleted' };
  }
}
