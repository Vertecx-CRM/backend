import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';
export declare class ProductsCategoriesService {
    create(createProductsCategoryDto: CreateProductsCategoryDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateProductsCategoryDto: UpdateProductsCategoryDto): string;
    remove(id: number): string;
}
