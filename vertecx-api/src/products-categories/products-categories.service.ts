import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  // 🟢 Crear categoría
  async create(createDto: CreateProductsCategoryDto) {
    // ✅ Verificar si ya existe una categoría con el mismo nombre
    const existing = await this.categoryRepo.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new BadRequestException({
        success: false,
        message: 'Ya existe una categoría con el mismo nombre.',
      });
    }

    // ✅ Crear instancia del nuevo registro
    const newCategory = this.categoryRepo.create({
      name: createDto.name,
      description: createDto.description ?? null,
      status: createDto.status,
      icon: createDto.icon ?? null,
    });

    // ✅ Guardar en la base de datos
    const saved = await this.categoryRepo.save(newCategory);
    return {
      success: true,
      message: 'Categoría creada correctamente.',
      data: saved,
    };
  }

  // 🟡 Listar todas las categorías
  async findAll() {
    const categories = await this.categoryRepo.find({
      order: { id: 'ASC' },
    });
    return { success: true, data: categories };
  }

  // 🔵 Buscar una categoría por ID
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Categoría con ID ${id} no encontrada.`,
      });
    }
    return { success: true, data: category };
  }

  // 🟠 Actualizar categoría
  async update(id: number, updateDto: UpdateProductsCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Categoría con ID ${id} no encontrada.`,
      });
    }

    // ✅ Verificar duplicado si el nombre viene en el DTO
    if (updateDto.name) {
      const existing = await this.categoryRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException({
          success: false,
          message: 'Ya existe una categoría con ese nombre.',
        });
      }
    }

    // ✅ Actualizar la entidad
    const updatedCategory = this.categoryRepo.merge(category, {
      ...updateDto,
    });

    const saved = await this.categoryRepo.save(updatedCategory);
    return {
      success: true,
      message: 'Categoría actualizada correctamente.',
      data: saved,
    };
  }

  // 🔴 Eliminar categoría
  async remove(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Categoría con ID ${id} no encontrada.`,
      });
    }

    await this.categoryRepo.remove(category);
    return {
      success: true,
      message: 'Categoría eliminada correctamente.',
    };
  }
}
