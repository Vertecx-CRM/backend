import { ProductsCategoriesService } from './products-categories.service';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-products-category.dto';
export declare class ProductsCategoriesController {
    private readonly productsCategoriesService;
    constructor(productsCategoriesService: ProductsCategoriesService);
    create(createProductsCategoryDto: CreateProductsCategoryDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateProductsCategoryDto: UpdateProductsCategoryDto): string;
    remove(id: string): string;
}
