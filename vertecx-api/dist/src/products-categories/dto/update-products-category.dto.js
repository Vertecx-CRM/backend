"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductsCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_products_category_dto_1 = require("./create-products-category.dto");
class UpdateProductsCategoryDto extends (0, mapped_types_1.PartialType)(create_products_category_dto_1.CreateProductsCategoryDto) {
}
exports.UpdateProductsCategoryDto = UpdateProductsCategoryDto;
//# sourceMappingURL=update-products-category.dto.js.map