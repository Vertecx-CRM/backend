"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesmanagementController = void 0;
const common_1 = require("@nestjs/common");
const create_purchasesmanagement_dto_1 = require("./dto/create-purchasesmanagement.dto");
const update_purchasesmanagement_dto_1 = require("./dto/update-purchasesmanagement.dto");
const swagger_1 = require("@nestjs/swagger");
const purchasesmanagement_entity_1 = require("./entities/purchasesmanagement.entity");
const purchasesmanagement_service_1 = require("./purchasesmanagement.service");
let PurchasesmanagementController = class PurchasesmanagementController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.PurchasesmanagementController = PurchasesmanagementController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un registro de compras' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: purchasesmanagement_entity_1.Purchasesmanagement }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_purchasesmanagement_dto_1.CreatePurchasesmanagementDto]),
    __metadata("design:returntype", void 0)
], PurchasesmanagementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los registros de compras' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchasesmanagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un registro por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: purchasesmanagement_entity_1.Purchasesmanagement }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchasesmanagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un registro de compras' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_purchasesmanagement_dto_1.UpdatePurchasesmanagementDto]),
    __metadata("design:returntype", void 0)
], PurchasesmanagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un registro de compras' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PurchasesmanagementController.prototype, "remove", null);
exports.PurchasesmanagementController = PurchasesmanagementController = __decorate([
    (0, swagger_1.ApiTags)('Purchases Management'),
    (0, common_1.Controller)('purchasesmanagement'),
    __metadata("design:paramtypes", [purchasesmanagement_service_1.PurchasesmanagementService])
], PurchasesmanagementController);
//# sourceMappingURL=purchasesmanagement.controller.js.map