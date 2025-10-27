"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAppoimentDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_appoiment_dto_1 = require("./create-appoiment.dto");
class UpdateAppoimentDto extends (0, mapped_types_1.PartialType)(create_appoiment_dto_1.CreateAppoimentDto) {
}
exports.UpdateAppoimentDto = UpdateAppoimentDto;
//# sourceMappingURL=update-appoiment.dto.js.map