import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';
import { ProductCategory } from './entities/product-category.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    private readonly dataSource: DataSource,
  ) { }

  // Crear categoría optimizada
  async create(createDto: CreateProductsCategoryDto) {
    const result = await this.categoryRepo
      .createQueryBuilder()
      .insert()
      .values({
        name: createDto.name,
        description: createDto.description ?? null,
        status: createDto.status,
        icon: createDto.icon ?? null,
      })
      .orIgnore() 
      .returning("*")
      .execute();

    // Si no se insertó nada, es porque ya existía (conflict)
    if (result.identifiers.length === 0) {
      throw new BadRequestException({
        success: false,
        message: "Ya existe una categoría con el mismo nombre.",
        data: null,
      });
    }

    // Categoría creada con éxito
    const created = result.raw[0];

    return {
      success: true,
      message: "Categoría creada correctamente.",
      data: created,
    };
  }


  // Listar todas las categorias
  async findAll() {
    return await this.categoryRepo
      .createQueryBuilder('category')
      .orderBy('category.id', 'ASC')
      .cache('product_categories_list', 60000)
      .getMany();
  }

  // Buscar una categoria por ID
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Categoria con ID ${id} no encontrada.`,
      });
    }
    return { success: true, data: category };
  }

  // Actualizar categoria
  async update(id: number, updateDto: UpdateProductsCategoryDto) {
    // Verificar que la categoría exista
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Categoria con ID ${id} no encontrada.`,
        data: null,
      });
    }

    // Validar duplicado en un solo query
    if (updateDto.name) {
      const duplicate = await this.categoryRepo.findOne({
        where: { name: updateDto.name, id: Not(id) },
      });

      if (duplicate) {
        throw new BadRequestException({
          success: false,
          message: 'Ya existe una categoria con ese nombre.',
          data: null,
        });
      }
    }

    // Actualización optimizada — sin cargar la entidad completa otra vez
    const result = await this.categoryRepo
      .createQueryBuilder()
      .update()
      .set({
        ...updateDto,
      })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    const updated = result.raw[0];

    // Invalidar caché de findAll()
    this.categoryRepo.manager.connection.queryResultCache?.remove([
      'product_categories_list',
    ]);

    // Respuesta uniforme
    return {
      success: true,
      message: 'Categoria actualizada correctamente.',
      data: updated,
    };
  }


  // Eliminar categoria
  async remove(id: number) {
    return await this.dataSource.transaction(async (manager) => {
      // Validar que la categoría exista
      const category = await manager
        .createQueryBuilder()
        .select("*")
        .from("categories", "c")
        .where("c.id = :id", { id })
        .getRawOne();

      if (!category) {
        throw new NotFoundException({
          success: false,
          message: `Categoria con ID ${id} no encontrada.`,
          data: null,
        });
      }

      // Verificar si existen productos asociados
      const productsCount = await manager
        .createQueryBuilder()
        .from("products", "p")
        .where("p.categoryId = :id", { id })
        .getCount();

      if (productsCount > 0) {
        throw new BadRequestException({
          success: false,
          message:
            "No se puede eliminar la categoría porque existen productos asociados. " +
            "Debe reasignar esos productos antes de eliminarla.",
          relatedProducts: productsCount,
        });
      }

      // Eliminar usando delete() + returning('*')
      const deleteResult = await manager
        .createQueryBuilder()
        .delete()
        .from("categories")
        .where("id = :id", { id })
        .returning("*")
        .execute();

      const deleted = deleteResult.raw[0];

      // Invalidar caché
      manager.connection.queryResultCache?.remove([
        "product_categories_list",
      ]);

      // Respuesta uniforme
      return {
        success: true,
        message: "Categoria eliminada correctamente.",
        data: deleted,
      };
    });
  }

}
